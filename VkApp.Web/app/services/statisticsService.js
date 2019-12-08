function StatisticsService(dataLoader) {

    function getAllTargetUsers(messages) {
        var allUsers = [];
        for (var item in messages) {
            if (messages.hasOwnProperty(item)) {
                allUsers = allUsers.concat(messages[item]);
            }
        }
        return allUsers;
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
        value = isNaN(value)
            ? 0
            : parseFloat(Math.round(value * 100) / 100).toFixed(2);

        return value + "%";
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
                id: user.id,
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

    function mapFrequenciesViewModel(statistics) {
        function createHeaders(aggregation) {
            var headers = ["Отправитель"];

            for (var i = 0; i < aggregation.info.length; i++) {
                headers.push(aggregation.info[i].displayName);
            }

            return headers;
        }

        function calculateSubscribedUsers(aggregationItems, membersDict) {
            var result = {};

            for (var i = 0; i < aggregationItems.length; i++) {
                var userIds = aggregationItems[i].userIds;

                result[aggregationItems[i].key] = {
                    total: userIds.length,
                    subscribed: calculateSubscribedCount(userIds, membersDict)
                };
            }

            return result;
        }

        function mapToCell(itemCalculations, addPercent) {
            var subscribed = itemCalculations ? itemCalculations.subscribed : 0;
            var total = itemCalculations ? itemCalculations.total : 0;

            return {
                text: subscribed + "/" + total,
                good: subscribed === total && total > 0,
                bad: total === 0,
                percent: addPercent ? percentFormat(subscribed / total * 100) : null
            };
        }

        function createRow(user, aggregation, calculations) {
            var rowCells = [];

            rowCells.push({ text: formatUserName(user) });

            for (var i = 0; i < aggregation.info.length; i++) {
                var itemCalculations = calculations[aggregation.info[i].key];
                rowCells.push(mapToCell(itemCalculations));
            }

            return rowCells;
        }

        function calculateTotals(calculations) {
            var totals = {};

            for (var i = 0; i < calculations.length; i++) {
                var itemCalculations = calculations[i];
                for (var item in itemCalculations) {
                    if (itemCalculations.hasOwnProperty(item)) {
                        var subtotal = totals[item] ? totals[item] : { subscribed: 0, total: 0 };
                        subtotal.subscribed += itemCalculations[item].subscribed;
                        subtotal.total += itemCalculations[item].total;
                        totals[item] = subtotal;
                    }
                }
            }

            return totals;
        }

        function createTotalsRow(aggregation, totals) {
            var rowCells = [];

            rowCells.push({ text: "Всего" });

            for (var i = 0; i < aggregation.info.length; i++) {
                var total = totals[aggregation.info[i].key];
                rowCells.push(mapToCell(total, true));
            }

            return rowCells;
        }

        function calculateFrequencyStatistics(users, aggregation, membersDict) {
            var calculations = [];
            var calculationsDict = {};

            for (var i = 0; i < users.length; i++) {
                var aggregationItems = aggregation.items[users[i].id];
                var itemCalculations = calculateSubscribedUsers(aggregationItems, membersDict);
                calculations.push(itemCalculations);
                calculationsDict[users[i].id] = itemCalculations;
            }

            return {
                calculations: calculationsDict,
                totals: calculateTotals(calculations)
            };
        }

        function createRows(users, aggregation, calculations) {
            var rows = [];

            for (var i = 0; i < users.length; i++) {
                var user = users[i];
                var itemCalculations = calculations[user.id];
                rows.push(createRow(user, aggregation, itemCalculations));
            }

            return rows;
        }

        var viewModel = {
            frequencies: [],
            values: []
        };

        for (var i = 0; i < statistics.aggregations.length; i++) {
            var aggregation = statistics.aggregations[i];
            var statisticsCalculations = calculateFrequencyStatistics(statistics.users, aggregation, statistics.membersDict);
            viewModel.frequencies.push(aggregation.frequency);
            viewModel.values.push({
                frequency: aggregation.frequency,
                headers: createHeaders(aggregation),
                rows: createRows(statistics.users, aggregation, statisticsCalculations.calculations),
                totals: createTotalsRow(aggregation, statisticsCalculations.totals)
            });
        }

        return viewModel;
    }

    function getStatisticsGroup(id) {
        return dataLoader.loadStatisticsGroups()
            .then(function (statisticsGroups) {
                var statisticsGroup = statisticsGroups.find(function (g) { return g.id === id; });
                if (!statisticsGroup) {
                    statisticsGroup = statisticsGroups.find(function (g) { return !g.id; });
                }
                return statisticsGroup;
            });
    }

    function filterByStatisticsGroup(statistics, statisticsGroup) {
        var activeUsersDict = {};
        for (var i = 0; i < statisticsGroup.selectedUsers.length; i++) {
            activeUsersDict[statisticsGroup.selectedUsers[i]] = true;
        }


        var users = statistics.users.filter(function (u) {
            return activeUsersDict[u.id];
        });

        var messages = {};
        for (var item in statistics.messages) {
            if (statistics.messages.hasOwnProperty(item) && activeUsersDict[parseInt(item)]) {
                messages[item] = statistics.messages[item];
            }
        }

        return {
            users: users,
            messages: messages,
            aggregations: statistics.aggregations
        };
    }

    return {
        getStatisticsGroups: function () {
            return dataLoader.loadStatisticsGroups();
        },

        getStatistics: function (statisticsGroupId) {
            return getStatisticsGroup(statisticsGroupId)
                .then(function (statisticsGroup) {
                    return dataLoader.loadMessagesStatistics()
                        .then(function (statistics) {

                            statistics = filterByStatisticsGroup(statistics, statisticsGroup);
                            var allTargetUsers = getAllTargetUsers(statistics.messages);

                            if (allTargetUsers.length > 0) {
                                return dataLoader.loadSubscribedUsers(allTargetUsers)
                                    .then(function (membersDict) {
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
                });
        }
    };
}