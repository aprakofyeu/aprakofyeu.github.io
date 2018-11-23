﻿function VkApp(urlHelper, callService, view, eventBroker) {
    function getLikesForPost(postUrl) {
        var postInfo = urlHelper.parsePostUrl(postUrl);

        callService.call("likes.getList",
            {
                type: 'post',
                owner_id: postInfo.ownerId,
                item_id: postInfo.itemId
            })
            .then(function (likes) {
                debugger;
            });
    }


    function initEvents() {
        eventBroker.subscribe("getLikesForPost", getLikesForPost);
    }


    return {
        init: function (authResponseUrl) {
            VK.init({
                apiId: 6757014
            });

            var authParameters = parseUrlParameters(authResponseUrl);

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

