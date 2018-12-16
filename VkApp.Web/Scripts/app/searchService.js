function SearchService(callService, eventBroker) {
    var batchSize = 100;

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
                    var userIds = joinUserIds(users);
                    if (!userIds) {
                        return users;
                    }

                    return callService.call("messages.getConversationsById",
                        {
                            peer_ids: joinUserIds(users)
                        })
                        .then(function (conversations) {
                            var conversationsDict = {};
                            for (var i = 0; i < conversations.items.length; i++) {
                                var conversationInfo = conversations.items[i];
                                if (conversationInfo.in_read ||
                                    conversationInfo.out_read ||
                                    conversationInfo.last_message_id) {
                                    conversationsDict[conversationInfo.peer.id] = true;
                                }
                            }

                            return users.filter(function (x) { return !conversationsDict[x.id]; });
                        });
                }
                return users;
            })
            .then(function (users) {
                if (searchParameters.notSubscribedToPublic) {
                    var userIds = joinUserIds(users);
                    if (!userIds) {
                        return users;
                    }

                    return callService.call("groups.isMember",
                        {
                            group_id: searchParameters.notSubscribedToPublic,
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
                    eventBroker.publish(VkAppEvents.searchCompleted, distinct(users));
                }, function (error) {
                    eventBroker.publish(VkAppEvents.searchFailed, error);
                });
        }
    };
}