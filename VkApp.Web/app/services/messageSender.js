function MessageSender(context, callService, storageService, formatter, progressBar, eventBroker) {

    function sendMessage(message, attachments, users) {
        var timeout, canceled;
        attachments = formatter.formatAttachments(attachments);

        function send(users, deferred) {
            var user = users[0];
            users = users.slice(1, users.length);
            var formattedMessage = formatter.format(message, user);

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
                        }, context.settings.messagesInterval * 1000);
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
                    },
                        function (error) {
                            reject(error);
                        });
            } else {
                storageService.haveMessagesByGroup(context.targetGroup.id, user.id)
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
                                    return storageService.saveMessage({
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
            progressBar.init(users, function () {
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
        sendToAll: function (message, attachments) {
            var users = context.searchResult.users.filter(function (user) { return !user.sent; });
            sendMessage(message, attachments, users);
        },

        sendToMe(message, attachments) {
            sendMessage(message, attachments, [context.user]);
        }
    };
}