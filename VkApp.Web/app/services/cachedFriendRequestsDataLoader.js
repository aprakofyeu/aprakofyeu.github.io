function CachedFriendRequestsDataLoader(apiService, callService, context, eventBroker) {
    var cachedColleagueFriendsLoadingRequested = false;
    var cachedColleagueFriendsDeferred = new DeferredList();

    function loadUsersFriendsDict(users) {
        function addToDict(friendsDict, friends) {
            for (var i = 0; i < friends.items.length; i++) {
                friendsDict[friends.items[i]] = friends.items[i];
            }
            return friendsDict;
        }

        function loadUserFriendsInner(index) {
            return callService.call("friends.get",
                {
                    user_id: users[index].id,
                    count: 10000
                }).then(function (friends) {
                    if (index < users.length - 1) {
                        return Utils.actionWithDelay(function () {
                            return loadUserFriendsInner(index + 1)
                                .then(function (friendsDict) {
                                    return addToDict(friendsDict, friends);
                                });
                        }, 300);
                    }
                    return addToDict({}, friends);
                });
        }

        return loadUserFriendsInner(0);
    }

    return {
        getColleagueFriends: function () {
            if (!cachedColleagueFriendsLoadingRequested) {
                cachedColleagueFriendsLoadingRequested = true;

                apiService.getSenderUsersByGroup()
                    .then(function (userIds) {

                        //add context userId if not exists
                        if (!userIds.find(function(userId) { return userId === context.user.id; })) {
                            userIds.push(context.user.id);
                        }

                        return callService.call("users.get",
                            {
                                user_ids: userIds.slice(0, 1000).join(',')
                            }).then(function (users) {
                                return users.filter(function (user) {
                                    return !user.deactivated && (!user.is_closed || user.can_access_closed);
                                });
                            });
                    })
                    .then(function (users) {
                        return loadUsersFriendsDict(users);
                    })
                    .then(function (friendsDict) {
                            cachedColleagueFriendsDeferred.resolve(friendsDict);
                        },
                        function (error) {
                            cachedColleagueFriendsDeferred.reject(error);
                        });
            }

            return cachedColleagueFriendsDeferred.promise();
        }

    };
}
