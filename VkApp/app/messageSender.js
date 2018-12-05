function MessageSender(context, callService, formatter, eventBroker) {
    function sendMessage(message, user) {
        message = formatter.format(message, user);

        callService.call("messages.send", { user_id: user.id, message: message })
            .then(function () {
                user.sent = true;
                eventBroker.publish(VkAppEvents.sendMessageOk, user.id);
            }, function (error) {
                eventBroker.publish(VkAppEvents.sendMessageFailed, user.id, error);
            });
    }

    return {
        sendToAll: function (message) {
            var users = context.searchResult.users;
            for (var i = 0; i < users.length; i++) {
                var user = users[i];
                if (!user.sent) {
//                    sendMessage(message, user);
                    eventBroker.publish(VkAppEvents.sendMessageFailed, user.id, "Опция временно отключена.");
                    user.sent = true;
                }
            }
        },

        sendToMe(message) {
            sendMessage(message, context.user);
        }
    };
}