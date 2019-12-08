function StatisticsPanelController(statisticsService, context, inputsHelper, progressBarHelper, eventBroker) {
    var $panel = $(".statistics-panel");
    var $summary = $panel.find(".summary.fail");
    var statisticsLoaded = false;
    var progressBar, inputs;

    function showError(error) {
        $summary
            .html("Опачки... Во время загрузки статистики что-то пошло не так...<br/>Ошибка: " + error)
            .show();
    }

    function hideError() {
        $summary.empty().hide();
    }

    function getDefaultSelectedStatisticsGroup(statisticsGroups) {
        var selectedStatisticsGroup = statisticsGroups
            .find(function (group) {
                return group.selectedUsers.find(function (userId) { return userId === context.user.id; });
            });

        if (!selectedStatisticsGroup) {
            selectedStatisticsGroup = statisticsGroups
                .find(function (group) { return !group.Id; });
        }

        return selectedStatisticsGroup;
    }

    function initStatisticsGroups() {
        statisticsService.getStatisticsGroups().then(function (statisticsGroups) {
            var selectedStatisticsGroup = getDefaultSelectedStatisticsGroup(statisticsGroups);

            var $selectedStatisticsGroupsElement = $panel.find("#selectedStatisticsGroups");


            inputsHelper.renderOptions(
                $selectedStatisticsGroupsElement,
                statisticsGroups,
                function (x) { return x.id; },
                function (x) { return x.name; },
                function (x) { return x.id === selectedStatisticsGroup.id; });


            $selectedStatisticsGroupsElement.on("change", function () {
                var statisticsGroupId = inputs.getIntValue("#selectedStatisticsGroups");
                loadStatistics(statisticsGroupId);
            });

            loadStatistics(selectedStatisticsGroup.id);
        });
    }

    function loadStatistics(selectedStatisticsGroupId) {
        statisticsService.getStatistics(selectedStatisticsGroupId)
            .then(function (statistics) {
                renderTotalStatistics(statistics.total);
                renderFrequencyStatistics(statistics.frequencies);
            }, function (error) {
                showError(error);
                hideStatusBar();
                statisticsLoaded = false;
            });
    }

    function refreshUi() {
        if (!statisticsLoaded) {
            hideError();
            initStatisticsGroups();
            inputs = inputsHelper.for($panel);
            statisticsLoaded = true;
        }
    }

    function renderTotalStatistics(statistics) {
        var $statisticsTable = $panel.find("#statisticsTemplate").tmpl({ statistics: statistics });
        $panel.find("#statisticsPanel").html($statisticsTable);
        $panel.find("#statisticsResultsPanel").show();
        hideStatusBar();
    }

    function showStatisticsByFrequency(frequency, tablesDict) {
        for (var freq in tablesDict) {
            if (tablesDict.hasOwnProperty(freq)) {
                tablesDict[freq].hide();
            }
        }

        tablesDict[frequency].show();
    }

    function renderFrequencyStatistics(statistics) {
        var $templateElement = $panel.find("#frequencyStatisticsTemplate");
        var $frequencyTemplateElement = $panel.find("#frequencySelectionTemplate");
        var $statisticsPanel = $panel.find("#frequenciesStatisticsPanel");

        $statisticsPanel.empty();

        //render frequency selection
        var frequenciesModel = {
            frequencies: statistics.frequencies.map(function (f, i) {
                return { name: f, isSelected: i === 0 };
            })
        };

        var $selectFrequencyElement = $frequencyTemplateElement.tmpl(frequenciesModel);
        $statisticsPanel.append($selectFrequencyElement);

        //render statistics tables
        var tablesDict = {};
        for (var i = 0; i < statistics.values.length; i++) {
            var frequencyValues = statistics.values[i];
            var $statisticsTable = $templateElement.tmpl(frequencyValues);
            $statisticsTable.hide();
            $statisticsPanel.append($statisticsTable);
            tablesDict[frequencyValues.frequency] = $statisticsTable;
        }

        $selectFrequencyElement.on("change", function () {
            var frequency = inputs.getValue("#selectFrequency");
            showStatisticsByFrequency(frequency, tablesDict);
        });

        showStatisticsByFrequency(statistics.frequencies[0], tablesDict);
    }

    function initStatusBar() {
        $panel.find("#statisticsResultsPanel").hide();

        var $progressBarElement = $panel.find("#statisticsStatusBar");
        $progressBarElement.show();

        progressBar =  progressBarHelper.create({
            element: $progressBarElement,
            completeLabel: "Статистика загружена!"
        });
    }

    function hideStatusBar() {
        $panel.find("#statisticsStatusBar").hide();
    }

    eventBroker.subscribe(VkAppEvents.showStatistics, refreshUi);
    eventBroker.subscribe(VkAppEvents.startLoadingStatistics, initStatusBar);
    eventBroker.subscribe(VkAppEvents.statisticsStatus, function (status) { progressBar.updateStatus(status); });
}