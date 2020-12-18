function SearchHelper(callService, apiService, context) {
    var batchSize = 500;

    return {
        batchSize: batchSize,
        distinctUsers: function (users) {
            if (users && users.length > 0) {
                var usersDict = {};
                var user, result = [];
                for (var i = 0; i < users.length; i++) {
                    user = users[i];
                    if (!usersDict[user.id]) {
                        result.push(user);
                    }
                    usersDict[user.id] = true;
                }
                return result;
            }
            return users;
        },

        loadLikeUsersBatch: function (postInfo, offset) {
            var totalLikesCount;
            return callService.call("likes.getList",
                {
                    type: 'post',
                    owner_id: postInfo.ownerId,
                    item_id: postInfo.itemId,
                    skip_own: 1,
                    offset: offset,
                    count: batchSize
                })
                .then(function (likes) {
                    totalLikesCount = likes.count;
                    return callService.call("users.get",
                        {
                            user_ids: likes.items.join(','),
                            fields: "photo_50,can_write_private_message,can_send_friend_request,is_friend,can_be_invited_group,online,city,country,last_seen"
                        });
                })
                .then(function (users) {
                    return { users: users, totalLikesCount: totalLikesCount };
                });
        },

        excludeMessagedByTargetGroup: function (users) {
            var userIds = users.map(function (user) { return user.id; });

            return apiService.getUsersWithoutMessagesByCurrentGroup(userIds)
                .then(function (userIdsWithoutMessages) {
                    var userIdsWithoutMessagesDict = {};
                    userIdsWithoutMessages.forEach(function (x) {
                        userIdsWithoutMessagesDict[x] = true;
                    });

                    return users.filter(function (user) {
                        return userIdsWithoutMessagesDict[user.id];
                    });
                });
        },

        excludeSubscribedToTargetGroup: function (users) {
            var userIds = users.map(function (x) { return x.id; }).join(",");

            if (!userIds) {
                return users;
            }

            return callService.call("groups.isMember",
                {
                    group_id: context.targetGroup.id,
                    user_ids: userIds
                })
                .then(function (results) {
                    var membersDict = {};
                    for (var i = 0; i < results.length; i++) {
                        if (results[i].member) {
                            membersDict[results[i].user_id] = true;
                        }
                    }

                    return users.filter(function (x) { return !membersDict[x.id]; });
                });
        },

        loadOutFriendRequests: function() {
            var friendRequestsBatchSize = 1000;

            function addToDict(friendsDict, friends) {
                if (friends && friends.length > 0) {
                    for (var i = 0; i < friends.length; i++) {
                        friendsDict[friends[i]] = friends[i];
                    }
                }
                return friendsDict;
            }

            function loadOutFriendRequests(offset) {
                return callService.call("friends.getRequests",
                        {
                            out: 1,
                            count: friendRequestsBatchSize,
                            offset: offset
                        })
                    .then(function (result) {
                        if (result.items && result.items.length > 0) {
                            return loadOutFriendRequests(offset + friendRequestsBatchSize)
                                .then(function(friendsDict) {
                                    return addToDict(friendsDict, result.items);
                                });
                        }
                        return addToDict({}, result.items);
                    });
            }

            return loadOutFriendRequests(0);
        }
    };
}