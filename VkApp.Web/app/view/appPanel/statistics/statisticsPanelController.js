function StatisticsPanelController(statisticsService, inputsHelper, progressBarHelper, eventBroker) {
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

    function refreshUi() {
        if (!statisticsLoaded) {
            inputs = inputsHelper.for($panel);

            hideError();
            refreshStatusBar();

            statisticsService.getStatistics()
                .then(function (statistics) {
                    renderTotalStatistics(statistics.total);
                    renderFrequencyStatistics(statistics.frequencies);
                }, function (error) {
                    showError(error);
                    statisticsLoaded = false;
                });

            statisticsLoaded = true;
        }
    }

    function renderTotalStatistics(statistics) {
        var $statisticsTable = $panel.find("#statisticsTemplate").tmpl({ statistics: statistics });
        $panel.find("#statisticsPanel").append($statisticsTable);
        $panel.find("#statisticsStatusBar").hide();
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
        var $statisticsPanel = $panel.find("#frequenciesStatisticsPanel");

        var tablesDict = {};
        for (var i = 0; i < statistics.values.length; i++) {
            var frequencyValues = statistics.values[i];
            var $statisticsTable = $templateElement.tmpl(frequencyValues);
            $statisticsTable.hide();
            $statisticsPanel.append($statisticsTable);
            tablesDict[frequencyValues.frequency] = $statisticsTable;
        }

        var selectedFrequency = statistics.frequencies[0];
        var $selectFrequencyElement = $panel.find("#selectFrequency");

        $selectFrequencyElement.on("change", function () {
            var frequency = inputs.getValue("#selectFrequency");
            showStatisticsByFrequency(frequency, tablesDict);
        });

        inputsHelper.renderOptions(
            $selectFrequencyElement,
            statistics.frequencies,
            function(x) { return x; },
            function(x) { return x; },
            function (x) { return x === selectedFrequency; });

        $statisticsPanel.show();
        showStatisticsByFrequency(selectedFrequency, tablesDict);
    }

    function refreshStatusBar() {
        progressBar =  progressBarHelper.create({
            element: $panel.find("#statisticsStatusBar"),
            completeLabel: "Статистика загружена!"
        });
    }

    eventBroker.subscribe(VkAppEvents.showStatistics, refreshUi);
    eventBroker.subscribe(VkAppEvents.statisticsStatus, function (status) { progressBar.updateStatus(status); });
}