function StatisticsPanelController(statisticsService, progressBarHelper, eventBroker) {
    var $panel = $(".statistics-panel");
    var $summary = $panel.find(".summary.fail");
    var statisticsLoaded = false;
    var progressBar;

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
            hideError();
            refreshStatusBar();

            statisticsService.getStatistics()
                .then(function (statistics) {
                    renderStatistics(statistics);
                }, function (error) {
                    showError(error);
                    statisticsLoaded = false;
                });

            statisticsLoaded = true;
        }
    }

    function renderStatistics(statistics) {
        var $statisticsTable = $panel.find("#statisticsTemplate").tmpl({ statistics: statistics });
        $panel.find("#statisticsPanel").html($statisticsTable);
        $panel.find("#statisticsStatusBar").hide();
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