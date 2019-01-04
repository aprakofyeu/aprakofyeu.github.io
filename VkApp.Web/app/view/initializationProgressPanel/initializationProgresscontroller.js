function InitializationProgressController(progressBarHelper, eventBroker) {
    var $panel = $(".initializationProgress");
    var $summary = $panel.find(".summary");
    var progressBar;

    function setTitle(text) {
        $panel.find("#initializationStatusTitle").html(text);
    }

    function refreshStatusBar() {
        progressBar = progressBarHelper.create({
            element: $panel.find("#initializationStatusBar"),
            completeLabel: "Инициализация выполнена!"
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

    eventBroker.subscribe(VkAppEvents.initializationStart, function () { refreshView("Загрузка и инициализация необходимых данных..."); });
    eventBroker.subscribe(VkAppEvents.initializationMessagesStart, function () { refreshView("Так как вы зашли сюда впервые - необходимо проинициализировать сообщения, отправленные с помощью старой версии приложения.<br/>Наберитесь немножечно терпения, это может занять несколько минут... ;)"); });
    eventBroker.subscribe(VkAppEvents.initializationStatus, function (status) { progressBar.updateStatus(status); });
    eventBroker.subscribe(VkAppEvents.initializationError, function (error) { showError(error); });
}