function SearchService(callService, apiService, context, eventBroker) {
    var batchSize = 500;

    function callWithDelay(action, delay) {
        var deferred = new $.Deferred();

        if (!delay) {
            delay = 1000;
        }

        setTimeout(function () {
            action().then(function (result) {
                deferred.resolve(result);
            }, function (error) {
                deferred.reject(error);
            });
        }, delay);

        return deferred.promise();
    }

    function distinct(users) {
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
    }

    function joinUserIds(users) {
        return users.map(function (x) { return x.id; }).join(",");
    }

    function searchInner(searchParameters, hits, offset) {
        var totalLikesCount = 0;

        return callService.call("likes.getList",
            {
                type: 'post',
                owner_id: searchParameters.postInfo.ownerId,
                item_id: searchParameters.postInfo.itemId,
                skip_own: 1,
                offset: offset,
                count: batchSize
            })
            .then(function (likes) {
                totalLikesCount = likes.count;
                return callService.call("users.get",
                    {
                        user_ids: likes.items.join(','),
                        fields: 'photo_50,can_write_private_message,online,city,country'
                    });
            })
            .then(function (users) {
                return users.filter(function (x) {
                    return (!searchParameters.canSendMessageOnly || x.can_write_private_message)
                        && (!searchParameters.onlineOnly || x.online)
                        && (!searchParameters.country || (x.country && x.country.id === searchParameters.country))
                        && (!searchParameters.city || (x.city && x.city.id === searchParameters.city));
                });
            })
            .then(function (users) {
                if (searchParameters.withoutConversationsWithMe) {
                    users = users.filter(function(user) {
                        return !context.conversations.users[user.id];
                    });
                }
                return users;
            })
            .then(function (users) {
                if (searchParameters.noMessagesByTargetGroup) {
                    var userIds = users.map(function(user) { return user.id; });

                    return apiService.getUsersWithoutMessagesByGroup(context.targetGroup.id, userIds)
                        .then(function(userIdsWithoutMessages) {
                            var userIdsWithoutMessagesDict = {};
                            userIdsWithoutMessages.forEach(function(x) {
                                userIdsWithoutMessagesDict[x] = true;
                            });

                            return users.filter(function(user) {
                                return userIdsWithoutMessagesDict[user.id];
                            });
                        });
                }
                return users;
            })
            .then(function (users) {
                if (searchParameters.notSubscribedToTargetGroup) {
                    var userIds = joinUserIds(users);
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
                }

                return users;
            })
            .then(function (users) {
                if (users.length > hits) {
                    return users.slice(0, hits);
                }

                if (users.length < hits) {
                    var moreOffset = offset + batchSize;
                    if (moreOffset < totalLikesCount) {

                        return callWithDelay(function () {
                            return searchInner(searchParameters, hits - users.length, moreOffset)
                                .then(function (moreUsers) {
                                    return users.concat(moreUsers);
                                });
                        });
                    }
                }

                return users;
            });
    }


    return {
        search: function (searchParameters) {
            eventBroker.publish(VkAppEvents.search, searchParameters);

            searchInner(searchParameters, searchParameters.hits, 0)
                .then(function (users) {
                    users = distinct(users);
                    context.setSearchResultUsers(users);
                    eventBroker.publish(VkAppEvents.searchCompleted, users);
                }, function (error) {
                    eventBroker.publish(VkAppEvents.searchFailed, error);
                });
        }
    };
}