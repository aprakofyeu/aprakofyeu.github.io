function MessageSender(context, callService, apiService, formatter, progressBar, eventBroker) {
    function saveUserMessages(messages) {

        if (context.settings.saveLastMessage) {
            messages = messages.map(function (x) {
                return {
                    message: formatter.escape(x.message),
                    attachments: JSON.stringify(x.attachments)
                };
            });

            apiService.saveUserMessages(messages)
                .then(
                    function (result) {
                        if (!result.success) {
                            eventBroker.publish(VkAppEvents.saveUserMessageError, result.error);
                        }
                    },
                    function (error) {
                        eventBroker.publish(VkAppEvents.saveUserMessageError, error);
                    });
        } else {
            apiService.clearUserSavedMessages();
        }
    }

    function sendMessage(messages, users) {
        var timeout, canceled;
        var messageIndex = 0;

        function send(users, deferred) {
            var user = users[0];
            var isSendToMe = user.id === context.user.id;

            messageIndex = messageIndex % messages.length;

            var attachments = formatter.formatAttachments(messages[messageIndex].attachments);
            var formattedMessage = formatter.format(messages[messageIndex].message, user);

            messageIndex += 1;

            if (!isSendToMe || messageIndex >= messages.length) {
                users = users.slice(1, users.length);
            }

            if (!deferred) {
                deferred = new $.Deferred();
            }

            function markAsSentAndSendNext() {
                progressBar.increase();
                user.sent = true;

                if (!canceled) {
                    if (users.length > 0) {
                        timeout = setTimeout(function () {
                            send(users, deferred);
                        }, isSendToMe ? 1000 : context.settings.sendInterval * 1000);
                    } else {
                        deferred.resolve();
                    }
                }
            }

            function deleteMessage(messageId) {
                callService.call("messages.delete", { message_ids: [messageId], delete_for_all: 1 });
            }

            function reject(error) {
                eventBroker.publish(VkAppEvents.sendMessageFailed, user.id, error);
                progressBar.finish(error);
                deferred.reject(error);
            }

            if (user.id === context.user.id) {
                callService.call("messages.send",
                    {
                        user_id: user.id,
                        message: formattedMessage,
                        attachment: attachments
                    })
                    .then(function () {
                        markAsSentAndSendNext();
                    }, function (error) {
                        reject(error);
                    });
            } else {
                apiService.haveMessagesByGroup(context.targetGroup.id, user.id)
                    .then(function (haveMessages) {
                        if (!haveMessages) {
                            return callService.call("messages.send",
                                {
                                    user_id: user.id,
                                    message: formattedMessage,
                                    attachment: attachments
                                })
                                .then(function (messageId) {
                                    context.addConversationUserId(user.id);
                                    return apiService.saveMessage({
                                        senderUserId: context.user.id,
                                        targetGroupId: context.targetGroup.id,
                                        targetUserId: user.id,
                                        applicationId: context.applicationId
                                    }).then(function (result) {

                                        if (result.success) {
                                            eventBroker.publish(VkAppEvents.sendMessageOk, user.id);
                                            markAsSentAndSendNext();
                                        } else {
                                            deleteMessage(messageId);
                                            reject(result.error);
                                        }
                                    }, function (error) {
                                        deleteMessage(messageId);
                                        reject(error);
                                    });
                                }, function (error) {
                                    reject(error);
                                });
                        }

                        progressBar.warning("Некоторые сообщения не были отправлены.");
                        eventBroker.publish(VkAppEvents.sendMessageWarning,
                            user.id,
                            "Сообщение не было отправлено, так как это уже сделал кто-то другой.");
                        markAsSentAndSendNext();

                    }, function (error) {
                        reject(error);
                    });
            }

            return deferred.promise();
        }

        if (users && users.length > 0) {
            var messagesCount = users[0].id === context.user.id
                ? messages.length
                : users.length;

            progressBar.init(messagesCount, function () {
                canceled = true;
                clearTimeout(timeout);
            });

            send(users).then(function () {
                progressBar.finish();
            }, function (error) {
                progressBar.finish(error);
            });
        }
    };

    return {
        sendToAll: function (messages) {
            var users = context.searchResult.users.filter(function (user) { return !user.sent; });
            sendMessage(messages, users);
        },

        sendToMe(messages) {
            sendMessage(messages, [context.user]);
        },

        saveUserMessages(messages) {
            saveUserMessages(messages);
        }
    };
}