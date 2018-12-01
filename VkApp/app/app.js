function VkApp(urlHelper, callService, eventBroker) {
    function sendMessageToAllUsers() {
        var message = view.getMessage();
        if (!message) {
            return;
        }

        var usersIds = view.getSelectedUserIds();

        for (var i = 0; i < usersIds.length; i++) {
            var userId = usersIds[i];
            callService.call("messages.send", { user_id: userId, message: message })
                .then(function () {
                    view.markAsMessageSent(userId);
                });
        }
    }

    return {
        init: function (authResponseUrl) {
            VK.init({
                apiId: 6757014
            });

            var authParameters = urlHelper.parseUrlParameters(authResponseUrl);

            this.userId = authParameters["user_id"];
            callService.init(authParameters["access_token"]);

            callService.call('users.get', { user_ids: this.userId })
                .then(function () {
                    $(".initialization").hide();
                    $(".app").show();
                    eventBroker.publish("authenticationCompleted");
                });
        }
    };
}

