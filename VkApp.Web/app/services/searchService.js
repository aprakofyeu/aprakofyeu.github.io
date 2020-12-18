function SearchService(searchHelper, context, eventBroker) {

    function searchInner(searchParameters, hits, offset) {
        var totalLikesCount = 0;
        var recentlyTimeEdge = Math.floor(Date.now() / 1000) - 60 * 60 * 6; //last 6 hours

        return searchHelper
            .loadLikeUsersBatch(searchParameters.postInfo, offset)
            .then(function (batch) {
                totalLikesCount = batch.totalLikesCount;
                return batch.users.filter(function (x) {
                    return (!searchParameters.canSendMessageOnly || x.can_write_private_message)
                        && (!searchParameters.onlineOnly || x.online)
                        && (!searchParameters.recenltyActivityOnly || (x.last_seen && (x.last_seen.time > recentlyTimeEdge)))
                        && (!searchParameters.country || (x.country && x.country.id === searchParameters.country))
                        && (!searchParameters.city || (x.city && x.city.id === searchParameters.city));
                });
            })
            .then(function (users) {
                if (searchParameters.noMessagesByTargetGroup) {
                    return searchHelper.excludeMessagedByTargetGroup(users);
                }
                return users;
            })
            .then(function (users) {
                if (searchParameters.notSubscribedToTargetGroup) {
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
            eventBroker.publish(VkAppEvents.search, searchParameters);

            searchInner(searchParameters, searchParameters.hits, 0)
                .then(function (users) {
                    users = searchHelper.distinctUsers(users);
                    context.setSearchResultUsers(users);
                    eventBroker.publish(VkAppEvents.searchCompleted, users);
                }, function (error) {
                    eventBroker.publish(VkAppEvents.searchFailed, error);
                });
        }
    };
}