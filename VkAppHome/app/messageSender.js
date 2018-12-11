function MessageSender(context, callService, formatter, progressBar, eventBroker) {

    function sendMessage(message, attachments, users) {
        var timeout, canceled, deferred;
        attachments = formatter.formatAttachments(attachments);

        function send(users) {
            var user = users[0];
            users = users.slice(1, users.length);
            var formattedMessage = formatter.format(message, user);

            callService.call("messages.send", { user_id: user.id, message: formattedMessage, attachment: attachments })
                .then(function () {
                    progressBar.increase();
                    user.sent = true;
                    eventBroker.publish(VkAppEvents.sendMessageOk, user.id);
                    if (!canceled) {
                        if (users.length > 0) {
                            timeout = setTimeout(function () {
                                send(users, deferred);
                            }, context.settings.messagesInterval * 1000);
                        } else {
                            deferred.resolve();
                        }
                    }
                },
                    function (error) {
                        eventBroker.publish(VkAppEvents.sendMessageFailed, user.id, error);
                        deferred.reject(error);
                    });

            return deferred.promise();
        }

        if (users && users.length > 0) {
            deferred = new $.Deferred();

            progressBar.init(users, function () {
                canceled = true;
                clearTimeout(timeout);
                deferred.reject("Отправка сообщений прервана.");
            });

            send(users).then(function () {
                progressBar.finish();
            }, function (error) {
                progressBar.finish("Во время отправки сообщений что-то пошло не так :(\r\nОшибка: " + error);
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