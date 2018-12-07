function MessageSender(context, callService, formatter, eventBroker) {
    function sendMessage(message, attachments, user) {
        message = formatter.format(message, user);
        attachments = formatter.formatAttachments(attachments);

        callService.call("messages.send", { user_id: user.id, message: message, attachment: attachments })
            .then(function () {
                user.sent = true;
                eventBroker.publish(VkAppEvents.sendMessageOk, user.id);
            }, function (error) {
                eventBroker.publish(VkAppEvents.sendMessageFailed, user.id, error);
            });
    }

    return {
        sendToAll: function (message, attachments) {
            var users = context.searchResult.users;
            for (var i = 0; i < users.length; i++) {
                var user = users[i];
                if (!user.sent) {
                    sendMessage(message, attachments, user);
                    //eventBroker.publish(VkAppEvents.sendMessageFailed, user.id, "Опция временно отключена.");
                    user.sent = true;
                }
            }
        },

        sendToMe(message, attachments) {
            sendMessage(message, attachments, context.user);
        }
    };
}