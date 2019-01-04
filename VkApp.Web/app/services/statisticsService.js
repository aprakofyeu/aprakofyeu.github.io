function StatisticsService(apiService, callService, context, eventBroker) {
    var BatchSize = 500;

    function getAllTargetUsers(messages) {
        var allUsers = [];
        for (var item in messages) {
            if (messages.hasOwnProperty(item)) {
                allUsers = allUsers.concat(messages[item]);
            }
        }
        return allUsers;
    }

    function mapResultsToDict(results) {
        var membersDict = {};

        for (var i = 0; i < results.length; i++) {
            if (results[i].member) {
                membersDict[results[i].user_id] = true;
            }
        }

        return membersDict;
    }

    function calculateSubscribedCount(sentIds, membersDict) {
        var count = 0;
        for (var i = 0; i < sentIds.length; i++) {
            if (membersDict[sentIds[i]]) {
                count++;
            }
        }
        return count;
    }

    function percentFormat(value) {
        return parseFloat(Math.round(value * 100) / 100).toFixed(2) + "%";
    }

    function matToViewModel(statistics) {
        var statisticsView = [];
        for (var i = 0; i < statistics.users.length; i++) {
            var user = statistics.users[i];
            var sentIds = statistics.messages[user.id];
            var subscribedCount = calculateSubscribedCount(sentIds, statistics.membersDict);

            statisticsView.push({
                name: user.firstName + " " + user.lastName,
                total: sentIds.length,
                subscribed: subscribedCount,
                percent: percentFormat(subscribedCount / sentIds.length * 100)
            });
        }
        return statisticsView;
    }

    function reportInitializationStatus(currentCount, totalCount) {
        eventBroker.publish(VkAppEvents.statisticsStatus, { currentCount: currentCount, totalCount: totalCount });
    }

    function loadSubsribedUsers(userIds) {
        function checkIsMember(offset, delay) {
            var userIdsBatch = userIds.slice(offset, offset + BatchSize);

            return callService.callWithDelay('groups.isMember', { group_id: context.targetGroup.id, user_ids: userIdsBatch }, delay)
                .then(function (results) {
                    var totalLoadedCount = offset + BatchSize;

                    reportInitializationStatus(totalLoadedCount, userIds.length);

                    if (totalLoadedCount < userIds.length) {
                        return checkIsMember(totalLoadedCount, 300)
                            .then(function (moreResults) {
                                return results.concat(moreResults);
                            });
                    }
                    return results;
                });
        }

        return checkIsMember(0, 0)
            .then(function (results) {
                return mapResultsToDict(results);
            });
    }

    return {
        getStatistics: function () {
            return apiService.getMessagesStatistics()
                .then(function (statistics) {
                    var allTargetUsers = getAllTargetUsers(statistics.messages);

                    return loadSubsribedUsers(allTargetUsers)
                        .then(function (membersDict) {
                            statistics.membersDict = membersDict;
                            return statistics;
                        });
                })
                .then(function (statistics) {
                    return matToViewModel(statistics);
                });
        }
    };
}