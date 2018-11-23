function VkApp(urlHelper, callService, view, eventBroker) {
    function getUsersInfo(usersIds){
        return callService.call("users.get", { user_ids: usersIds.join(','), fields:'photo_50' });
    }


    function getLikesForPost(postUrl) {
        var postInfo = urlHelper.parsePostUrl(postUrl);

        callService.call("likes.getList",
            {
                type: 'post',
                owner_id: postInfo.ownerId,
                item_id: postInfo.itemId
            })
            .then(function (likes) {
                getUsersInfo(likes.items).then(function (users) {
                    view.renderUsersList(users);
                    view.showMessagePanel();
                });
            });
    }

    function sendMessageToAllUsers() {
        var message = view.getMessage();
        if (!message) {
            return;
        }

        var usersIds = view.getSelectedUserIds();

        for (var i = 0; i < usersIds.length; i++) {
            callService.call("messages.send", { user_id: usersIds[i], message: message })
                .then(function (userId) {
                    view.markAsMessageSent(userId);
                });
        }
    }

    function initEvents() {
        eventBroker.subscribe("getLikesForPost", getLikesForPost);
        eventBroker.subscribe("sendMessageToAllUsers", sendMessageToAllUsers);

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
                    view.switchToAppMode();
                });

            initEvents();
        }
    };
}

