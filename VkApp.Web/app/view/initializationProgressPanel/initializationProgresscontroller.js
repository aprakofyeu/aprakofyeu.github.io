function InitializationProgressController(eventBroker) {
    var $panel = $(".initializationProgress");
    var $summary = $panel.find(".summary");
    var $progressbar;

    function setTitle(text) {
        $panel.find("#initializationStatusTitle").html(text);
    }

    function refreshStatusBar() {
        $progressbar = $panel.find("#initializationStatusBar").progressbar({
            max: 100,
            value: 0,
            change: function () {
                var value = $progressbar.progressbar("value");
                $(this).find(".progress-label").text("Готово на " + value + "%");
            },
            complete: function () {
                $(this).find(".progress-label").text("Инициализация выполнена!");
            }
        });
    }

    function showError(error) {
        $summary
            .html("Ой-ёй... Что-то пошло не так...<br/>Ошибка: " + error + "<br/>Обновите страницу и попробуйте еще раз...")
            .show();
    }

    function clearErrors() {
        $summary.empty().hide();
    }

    function refreshView(title) {
        setTitle(title);
        refreshStatusBar();
        clearErrors();
    }

    function updateStatus(status) {
        var value = Math.round(status.currentCount / status.totalCount * 100);
        $progressbar.progressbar("value", value);
    }


    eventBroker.subscribe(VkAppEvents.initializationStart, function () { refreshView("Загрузка и инициализация необходимых данных..."); });
    eventBroker.subscribe(VkAppEvents.initializationMessagesStart, function () { refreshView("Так как вы зашли сюда впервые - необходимо проинициализировать сообщения, отправленные с помощью старой версии приложения.<br/>Наберитесь немножечно терпения, это может занять несколько минут... ;)"); });
    eventBroker.subscribe(VkAppEvents.initializationStatus, function (status) { updateStatus(status); });
    eventBroker.subscribe(VkAppEvents.initializationError, function (error) { showError(error); });
}