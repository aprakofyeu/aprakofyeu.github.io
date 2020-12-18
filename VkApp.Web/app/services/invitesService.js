function InvitesService(groupUsersDataLoader, context, callService, apiService, eventBroker) {
    var friendsInfo;

    function loadAllFriends() {
        function loadAllFriendsInner(offset, batchSize) {
            return callService.call("friends.search",
                {
                    offset: offset,
                    count: batchSize,
                    user_id: context.user.id,
                    fields: "id,first_name,last_name,photo_50,can_be_invited_group,last_seen"
                })
                .then(function (response) {
                    if (response.items && response.items.length > 0) {
                        return loadAllFriendsInner(offset + batchSize, batchSize)
                            .then(function (friends) {
                                return response.items.concat(friends);
                            });
                    }
                    return response.items;
                });
        }

        return loadAllFriendsInner(0, 1000);
    }

    function loadFriendsInfo() {
        function getIds(items) {
            var ids = [];
            for (var i = 0; i < items.length; i++) {
                ids.push(items[i].id);
            }
            return ids;
        }

        function parseMembers(members) {
            var userIds = [];
            var subscribedCount = 0;
            for (var i = 0; i < members.length; i++) {
                if (members[i].can_invite) {
                    userIds.push(members[i].user_id);
                }
                if (members[i].member) {
                    subscribedCount++;
                }
            }
            return {
                availableToInviteUserIds: userIds,
                subscribedUsersCount: subscribedCount
            };
        }

        function excludeInvited(userIds, invitedUserIds, friendsDict) {
            var invitedUsersDict = {};
            for (var i = 0; i < invitedUserIds.length; i++) {
                invitedUsersDict[invitedUserIds[i]] = true;
            }

            return userIds.filter(function (userId) {
                return friendsDict[userId].can_be_invited_group
                    && !invitedUsersDict[userId];
            });
        }

        function aggregateResults(friends, members, invitedUsers) {
            var totalFriendsCount = friends.length;
            var parsedMembers = parseMembers(members);

            var friendsDict = {};
            var deactivatedFriendsInfo = {
                deleted: [],
                banned: []
            };

            for (var i = 0; i < friends.length; i++) {
                friendsDict[friends[i].id] = friends[i];

                var deactivated = friends[i].deactivated;
                if (deactivated) {
                    if (!deactivatedFriendsInfo[deactivated])
                        deactivatedFriendsInfo[deactivated] = [];

                    deactivatedFriendsInfo[deactivated].push(friends[i]);
                }
            }

            var availableToInvite = excludeInvited(parsedMembers.availableToInviteUserIds, invitedUsers, friendsDict);

            return {
                friendsCount: totalFriendsCount,
                friends: friendsDict,
                deactivatedFriends: deactivatedFriendsInfo,
                subscribedCount: parsedMembers.subscribedUsersCount,
                availableToInviteCount: availableToInvite.length,
                availableToInvite: availableToInvite,
                getFriendsLastSeenLessThan: function getFriendsLastSeenLessThan(lastSeen) {
                    var result = [];
                    var unixTime = Math.trunc(lastSeen.getTime() / 1000);

                    for (var item in this.friends) {
                        if (this.friends.hasOwnProperty(item)) {
                            var friend = this.friends[item];
                            if (friend.last_seen && friend.last_seen.time < unixTime) {
                                result.push(friend);
                            }
                        }
                    }

                    return result;
                }
            };
        }

        if (!friendsInfo) {

            var invitedUsersPromise = apiService.getInvitedUsers();

            return loadAllFriends()
                .then(function (friends) {
                    var userIds = getIds(friends);
                    return groupUsersDataLoader.checkIsMembers(userIds, true)
                        .then(function (members) {
                            return invitedUsersPromise
                                .then(function (invitedUsers) {
                                    return aggregateResults(friends, members, invitedUsers);
                                });
                        });
                }).then(function (result) {
                    friendsInfo = result;
                    return result;
                }, function (error) {
                    eventBroker.publish(VkAppEvents.invitesLoadingError, error);
                });
        }

        return Utils.asPromise(friendsInfo);
    }

    function inviteFriends() {

        function inviteFriend(friend) {
            return callService.call("groups.invite", { group_id: context.targetGroup.id, user_id: friend.id })
                .then(function (invited) {
                    if (invited) {
                        eventBroker.publish(VkAppEvents.inviteUserSuccess, friend);
                        return apiService.markAsInvited(friend.id);
                    }
                });
        }

        loadFriendsInfo().then(function (friends) {
            function inviteNext(index) {
                var userId = friends.availableToInvite[index];
                var friend = friends.friends[userId];
                inviteFriend(friend)
                    .then(function () {
                        Utils.actionWithDelay(function () {
                            if (index >= friends.availableToInviteCount - 1) {
                                eventBroker.publish(VkAppEvents.inviteCompleted);
                            } else {
                                inviteNext(index + 1);
                            }
                        }, 1000);
                    }).then(function () {
                    },
                        function (error) {
                            eventBroker.publish(VkAppEvents.inviteError, friend, error);
                        });
            }

            inviteNext(0);
        });
    }

    function removeFromFriendsInfo(friend) {
        //remove from available to invite
        var index = friendsInfo.availableToInvite.indexOf(friend.id);
        if (index > -1) {
            friendsInfo.availableToInvite.splice(index, 1);
            friendsInfo.availableToInviteCount = friendsInfo.availableToInvite.length;
        }

        //remove from friends
        delete friendsInfo.friends[friend.id];
        friendsInfo.friendsCount--;

        //remove from deactivated friends
        index = friendsInfo.deactivatedFriends.banned.indexOf(friend);
        if (index > -1) {
            friendsInfo.deactivatedFriends.banned.splice(index, 1);
        }
        index = friendsInfo.deactivatedFriends.deleted.indexOf(friend);
        if (index > -1) {
            friendsInfo.deactivatedFriends.deleted.splice(index, 1);
        }
    }

    function deleteFriends(friends) {
        function deleteFriend(friend) {
            return callService.call("friends.delete", { user_id: friend.id })
                .then(function (result) {
                    if (result.success) {
                        removeFromFriendsInfo(friend);
                        eventBroker.publish(VkAppEvents.deleteFriendSuccess, friend);
                        return true;
                    }

                    eventBroker.publish(VkAppEvents.deleteFriendError, friend, "Delete friend failed..");
                    return false;
                });
        }

        function deleteNext(index) {
            var friend = friends[index];
            deleteFriend(friend)
                .then(function (deleteSuccess) {
                    Utils.actionWithDelay(function () {
                        if (!deleteSuccess || index >= friends.length - 1) {
                            eventBroker.publish(VkAppEvents.deleteFriendsCompleted);
                        } else {
                            deleteNext(index + 1);
                        }
                    }, 1000);
                }).then(function () {
                },
                    function (error) {
                        eventBroker.publish(VkAppEvents.deleteFriendError, friend, error);
                    });
        }

        deleteNext(0);
    }

    return {
        loadFriendsInfo: function () {
            return loadFriendsInfo();
        },
        inviteFriends: function () {
            inviteFriends();
        },
        deleteFriends: function (friends) {
            deleteFriends(friends);
        }
    };
}