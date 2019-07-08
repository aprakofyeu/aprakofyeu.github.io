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

    function formatUserName(user) {
        return user.firstName + " " + user.lastName;
    }

    function mapTotalViewModel(statistics) {
        var statisticsView = [];

        var totalSent = 0;
        var totalSubscribed = 0;
        for (var i = 0; i < statistics.users.length; i++) {
            var user = statistics.users[i];
            var sentIds = statistics.messages[user.id];
            var subscribedCount = calculateSubscribedCount(sentIds, statistics.membersDict);

            totalSent += sentIds.length;
            totalSubscribed += subscribedCount;
            
            statisticsView.push({
                name: formatUserName(user),
                total: sentIds.length,
                subscribed: subscribedCount,
                percent: percentFormat(subscribedCount / sentIds.length * 100)
            });
        }

        statisticsView.push({
            name: "Всего",
            total: totalSent,
            subscribed: totalSubscribed,
            percent: percentFormat(totalSubscribed / totalSent * 100),
            isTotals: true
        });

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
                return mapResultsToDict(results);
            });
    }

    function mapFrequenciesViewModel(statistics) {

        function createHeaders(aggregation) {
            var headers = ["Отправитель"];

            for (var i = 0; i < aggregation.info.length; i++) {
                headers.push(aggregation.info[i].displayName);
            }

            return headers;
        }

        function createRow(user, aggregationItems, membersDict) {
            var rowCells = [];

            rowCells.push({ text: formatUserName(user) });

            for (var i = 0; i < aggregationItems.length; i++) {
                var userIds = aggregationItems[i].userIds;
                var total = userIds.length;
                var subscribed = calculateSubscribedCount(userIds, membersDict);

                rowCells.push({
                    text: subscribed + "/" + total,
                    good: subscribed === total && total > 0,
                    bad: total === 0
                });
            }

            return rowCells;
        }

        function createRows(users, aggregation, membersDict) {
            var rows = [];

            for (var i = 0; i < users.length; i++) {
                var user = users[i];
                rows.push(createRow(user, aggregation.items[user.id], membersDict));
            }

            return rows;
        }

        var viewModel = {
            frequencies: [],
            values: []
        };

        for (var i = 0; i < statistics.aggregations.length; i++) {
            var aggregation = statistics.aggregations[i];
            viewModel.frequencies.push(aggregation.frequency);
            viewModel.values.push({
                frequency: aggregation.frequency,
                headers: createHeaders(aggregation),
                rows: createRows(statistics.users, aggregation, statistics.membersDict)
            });
        }

        return viewModel;
    }

    return {
        getStatistics: function () {
            return apiService.getMessagesStatistics()
                .then(function (statistics) {
                    var allTargetUsers = getAllTargetUsers(statistics.messages);

                    if (allTargetUsers.length > 0) {
                        return loadSubsribedUsers(allTargetUsers)
                            .then(function(membersDict) {
                                statistics.membersDict = membersDict;
                                return statistics;
                            });
                    }

                    statistics.membersDict = {};
                    return statistics;
                })
                .then(function (statistics) {
                    return {
                        total: mapTotalViewModel(statistics),
                        frequencies: mapFrequenciesViewModel(statistics)
                    };
                });
        }
    };
}