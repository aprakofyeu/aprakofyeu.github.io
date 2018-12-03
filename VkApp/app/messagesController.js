function MessagesController(callService, eventBroker) {
    var users = [];

    var $panel = $(".message-panel");

    $panel.find("#sendMessageButton").on("click",
        function () {
            var message = $panel.find("#message").val();
            if (!message) {
                return;
            }

            for (var i = 0; i < users.length; i++) {
                var userId = users[i].id;
                eventBroker.publish(VkAppEvents.sendMessageOk, userId);
//                (function (userId) {
//                    callService.call("messages.send", { user_id: userId, message: message })
//                        .then(function () {
//                            eventBroker.publish(VkAppEvents.sendMessageOk, userId);
//                        }, function (error) {
//                            eventBroker.publish(VkAppEvents.sendMessageFailed, userId, error);
//                        });
//                })(userId);
            }
        });

    eventBroker.subscribe(VkAppEvents.searchCompleted, function (newUsers) {
        users = newUsers;
//        users = [
//            { id: 34545583 },
//            { id: 129047179 }
//        ];
        $panel.show();
    });

}