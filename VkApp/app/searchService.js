function SearchService(callService, eventBroker) {
    var that = this;
    that.eventBroker = eventBroker;
    that.callService = callService;

    function initEvents() {
        eventBroker.subscribe(VkAppEvents.search, function (searchParams) { that.search(searchParams); });
    }

    initEvents();
}

SearchService.prototype.search = function (searchParams) {
    var that = this;
    that.callService.call("likes.getList",
            {
                type: 'post',
                owner_id: searchParams.postInfo.ownerId,
                item_id: searchParams.postInfo.itemId,
                skip_own: 1,
                count: 100
            })
        .then(function(likes) {
            return that.callService.call("users.get",
                {
                    user_ids: likes.items.join(','),
                    fields: 'photo_50,can_write_private_message'
                });
        })
        .then(function(users) {
            if (searchParams.canSendMessageOnly) {
                users = users.filter(function(x) { return x.can_write_private_message; });
            }
            return users;
        })
        .then(function(users) {
            if (searchParams.withoutConversationsWithMe) {
                return that.callService.call("messages.getConversationsById",
                        {
                            peer_ids: users.map(function(x) { return x.id }).join(",")
                        })
                    .then(function(conversations) {
                        var conversationsDict = {};
                        for (var i = 0; i < conversations.items.length; i++) {
                            var conversationInfo = conversations.items[i];
                            if (conversationInfo.in_read || conversationInfo.out_read || conversationInfo.last_message_id) {
                                conversationsDict[conversationInfo.peer.id] = true;
                            }
                        }

                        return users.filter(function(x) { return !conversationsDict[x.id]; });
                    });
            }
            return users;
        })
        .then(function (users) {
            //TODO: filter by not subscribed to group
            return users;
        })
        .then(function (users) {
            if (users.length > searchParams.hits) {
                return users.slice(0, searchParams.hits);
            }

            //TODO: if users.length<searchParams.hits && total count > chunk size then call recursive this method to load more results and merge it
            return users;
        })
        .then(function (users) {
            that.eventBroker.publish(VkAppEvents.searchCompleted, users);
        });
};