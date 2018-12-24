function ResultsController(eventBroker) {
    var $panel = $(".results-panel");
    var $results = $panel.find(".result-users");

    function hideError() {
        $panel.find(".summary.fail").empty().hide();
    }

    function showError(error) {
        $results.empty();
        $panel.find(".summary.fail")
            .html("Опачки... Во время поиска что-то пошло не так...<br/>Ошибка: "
                + error
                + "<br/>Попробуйте еще раз")
            .show();
    }

    function showLoader() {
        hideError();
        $results.html("<div class='loader'></div>");
    }

    function renderUsers(users) {
        if (users && users.length > 0) {
            var $users = $("#usersTemplate").tmpl(users);
            $results.html($users);
        } else {
            $results.html("К сожалению, поиск не дал результатов...");
        }
    }

    function getUserStatusPanel(userId) {
        return $results.find("[user-id=" + userId + "] .status-panel");
    }

    function markAsSent(userId) {
        getUserStatusPanel(userId).append("<div class='ok' title='Отправлено!'></div>");
    }

    function markAsFailed(userId, error) {
        getUserStatusPanel(userId).append("<div class='fail' title='" + error + "'></div>");
    }

    function markAsWarning(userId, warning) {
        getUserStatusPanel(userId).append("<div class='warning' title='" + warning + "'></div>");
    }

    eventBroker.subscribe(VkAppEvents.search, function () { showLoader(); });
    eventBroker.subscribe(VkAppEvents.searchCompleted, function (users) { renderUsers(users); });
    eventBroker.subscribe(VkAppEvents.searchFailed, function (error) { showError(error); });
    eventBroker.subscribe(VkAppEvents.sendMessageOk, function (userId) { markAsSent(userId); });
    eventBroker.subscribe(VkAppEvents.sendMessageWarning, function (userId, warning) { markAsWarning(userId, warning); });
    eventBroker.subscribe(VkAppEvents.sendMessageFailed, function (userId, error) { markAsFailed(userId, error); });
}