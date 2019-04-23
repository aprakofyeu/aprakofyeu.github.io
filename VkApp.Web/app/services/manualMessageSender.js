function ManualMessageSender(context, messagesController, formatter, apiService, eventBroker) {
    var lastSentMessageIndex = 0;

    function openUserDialog(url) {
        var win = window.open(url, '_blank');
        win.focus();
    }

    function getMessageForSend() {
        var messages = messagesController.getMessages();
        if (messages && messages.length>0) {
            if (lastSentMessageIndex >= messages.length) {
                lastSentMessageIndex = 0;
            }
            return messages[lastSentMessageIndex++];
        }
        return null;
    }

    return {
        sendMessage: function (userId) {
            var message = getMessageForSend();

            if (!message) {
                alert("Oooops... Для того чтобы отправить сообщение, введите его внизу страницы, в панели сообщений!");
                return;
            }

            var targetUser = context.searchResult.users.find(function (u) { return !u.sent && u.id === userId; });
            if (!targetUser) {
                alert("Oooops... Cообщение этому пользователю уже отправлено!");
                return;
            }

            var url = formatter.formatMessageForUrl(message.message, message.attachments, targetUser, context.user);

            apiService.saveMessage({
                senderUserId: context.user.id,
                targetGroupId: context.targetGroup.id,
                targetUserId: userId,
                applicationId: context.applicationId
            }).then(function (result) {
                if (result.success) {
                    openUserDialog(url);
                    eventBroker.publish(VkAppEvents.sendMessageOk, userId);
                } else {
                    alert("Oooops... Кто-то уже отправил сообщение этому пользователю!");
                    eventBroker.publish(VkAppEvents.sendMessageWarning, userId, "Кто-то уже отправил сообщение этому пользователю!");
                }
            }, function (error) {
                alert("Oooops... Не удвется отправить сообщение... Попробуйте обновить страницу и повторить попытку.");
                eventBroker.publish(VkAppEvents.sendMessageFailed, userId, "Ошибка при попытке отправить сообщение...");
            });
        }
    };
}