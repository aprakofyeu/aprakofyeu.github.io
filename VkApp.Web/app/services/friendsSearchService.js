﻿function FriendsSearchService(searchHelper, cachedFriendRequestsDataLoader, apiService, callService, eventBroker) {

    function searchInner(searchParameters, hits, offset) {
        var totalLikesCount = 0;

        function mapToDict(userIds) {
            var userIdsDict = {};
            for (var i = 0; i < userIds.length; i++) {
                userIdsDict[userIds[i]] = userIds[i];
            }
            return userIdsDict;
        }

        return searchHelper
            .loadLikeUsersBatch(searchParameters.postInfo, offset)
            .then(function (batch) {
                totalLikesCount = batch.totalLikesCount;
                return batch.users.filter(function (x) {
                    return !x.is_friend && !x.deactivated
                        && x.can_be_invited_group
                        && (!searchParameters.canFriendsRequest || x.can_send_friend_request)
                        && (!searchParameters.country || (x.country && x.country.id === searchParameters.country))
                        && (!searchParameters.city || (x.city && x.city.id === searchParameters.city));
                });
            })
            .then(function (users) {
                if (users.length > 0 && searchParameters.noFriendRequestedLastTime) {
                    return apiService.getFriendRequests()
                        .then(function (friendRequests) {
                            var friendRequestsDict = mapToDict(friendRequests);
                            return users.filter(function (user) {
                                return !friendRequestsDict[user.id];
                            });
                        });
                }
                return users;
            })
            .then(function (users) {
                if (users.length > 0) {
                    //exclude my out friend requests
                    return searchHelper.loadOutFriendRequests()
                        .then(function(outFriendRequestsDict) {
                            return users.filter(function(user) {
                                return !outFriendRequestsDict[user.id];
                            });
                        });
                }
                return users;
            })
            .then(function (users) {
                if (users.length > 0 && searchParameters.notInColleagueFriends) {
                    return cachedFriendRequestsDataLoader.getColleagueFriends()
                        .then(function (colleagueFriendsDict) {
                            return users.filter(function (user) {
                                return !colleagueFriendsDict[user.id];
                            });
                        });
                }
                return users;
            })
            .then(function (users) {
                if (users.length > 0 && searchParameters.noMessagesByTargetGroup) {
                    return searchHelper.excludeMessagedByTargetGroup(users);
                }
                return users;
            })
            .then(function (users) {
                if (users.length > 0 && searchParameters.notSubscribedToTargetGroup) {
                    return searchHelper.excludeSubscribedToTargetGroup(users);
                }
                return users;
            })
            .then(function (users) {
                if (users.length > hits) {
                    return users.slice(0, hits);
                }

                if (users.length < hits) {
                    var moreOffset = offset + searchHelper.batchSize;
                    if (moreOffset < totalLikesCount) {
                        return searchInner(searchParameters, hits - users.length, moreOffset)
                            .then(function (moreUsers) {
                                return users.concat(moreUsers);
                            });
                    }
                }

                return users;
            });
    }

    return {
        search: function (searchParameters) {
            eventBroker.publish(VkAppEvents.searchFriends, searchParameters);

            searchInner(searchParameters, searchParameters.hits, 0)
                .then(function (users) {
                    users = searchHelper.distinctUsers(users);
                    eventBroker.publish(VkAppEvents.searchFriendsCompleted, users);
                }, function (error) {
                    eventBroker.publish(VkAppEvents.searchFriendsFailed, error);
                });
        }
    };
}