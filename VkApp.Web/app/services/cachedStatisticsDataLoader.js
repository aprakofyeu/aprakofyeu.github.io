﻿function CachedStatisticsDataLoader(context, callService, apiService, eventBroker) {
    var BatchSize = 500;

    var statisticsGroupsCache, messagesCache;
    var membersCache = {};

    function asPromise(obj) {
        var deferred = new $.Deferred();
        return deferred.resolve(obj);
    }

    function appendResultsToDict(results) {
        for (var i = 0; i < results.length; i++) {
            membersCache[results[i].user_id] = !!results[i].member;
        }
    }

    function getNotLoadedUsers(userIds) {
        return userIds.filter(function (userId) {
            return !membersCache.hasOwnProperty(userId);
        });
    }

    function filterByUsers(userIds) {
        var result = {};
        for (var i = 0; i < userIds.length; i++) {
            if (membersCache[userIds[i]]) {
                result[userIds[i]] = true;
            }
        }
        return result;
    }

    function reportInitializationStatus(currentCount, totalCount) {
        eventBroker.publish(VkAppEvents.statisticsStatus, { currentCount: currentCount, totalCount: totalCount });
    }

    function loadSubscribedUsers(userIds) {
        function checkIsMember(offset, delay) {
            var userIdsBatch = userIds.slice(offset, offset + BatchSize);

            return callService.callWithDelay('groups.isMember', { group_id: context.targetGroup.id, user_ids: userIdsBatch }, delay)
                .then(function (results) {
                    var totalLoadedCount = offset + BatchSize;

                    reportInitializationStatus(totalLoadedCount, userIds.length);

                    if (totalLoadedCount < userIds.length) {
                        return checkIsMember(totalLoadedCount, 250)
                            .then(function (moreResults) {
                                return results.concat(moreResults);
                            });
                    }
                    return results;
                });
        }

        return checkIsMember(0, 0)
            .then(function (results) {
                appendResultsToDict(results);
            });
    }

    return {
        loadStatisticsGroups: function () {
            if (!statisticsGroupsCache) {
                eventBroker.publish(VkAppEvents.startLoadingStatistics);

                return apiService.getStatisticsGroups()
                    .then(function (statisticsGroups) {
                        statisticsGroupsCache = statisticsGroups;
                        return statisticsGroupsCache;
                    });
            }

            return asPromise(statisticsGroupsCache);
        },

        loadMessagesStatistics: function () {
            if (!messagesCache) {
                eventBroker.publish(VkAppEvents.startLoadingStatistics);

                return apiService.getAllMessages()
                    .then(function (messages) {
                        messagesCache = messages;
                        return messagesCache;
                    });
            }

            return asPromise(messagesCache);
        },

        loadSubscribedUsers: function (userIds) {
            var notLoadedUsers = getNotLoadedUsers(userIds);
            if (notLoadedUsers.length > 0) {
                eventBroker.publish(VkAppEvents.startLoadingStatistics);

                return loadSubscribedUsers(notLoadedUsers)
                    .then(function () {
                        return filterByUsers(userIds);
                    });
            }

            return asPromise(filterByUsers(userIds));
        }
    };
}