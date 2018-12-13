function ResultsController(eventBroker) {
    var $panel = $(".results");

    function showLoader() {
        $panel.html("<div class='loader'></div>");
    }

    function showError(error) {
        $panel.html("<div class='summary fail'>" + error + "</div>");
    }

    function renderUsers(users) {
        if (users && users.length > 0) {
            var $users = $("#usersTemplate").tmpl(users);
            $panel.html($users);
        } else {
            $panel.html("К сожалению, поиск не дал результатов...");
        }
    }

    function getUserStatusPanel(userId) {
        return $panel.find("[user-id=" + userId + "] .status-panel");
    }

    function markAsSent(userId) {
        getUserStatusPanel(userId).append("<div class='ok'></div>");
    }

    function markAsFailed(userId, error) {
        getUserStatusPanel(userId).append("<div class='fail' title='" + error + "'></div>");
    }


    eventBroker.subscribe(VkAppEvents.search, function () { showLoader(); });
    eventBroker.subscribe(VkAppEvents.searchCompleted, function (users) { renderUsers(users); });
    eventBroker.subscribe(VkAppEvents.searchFailed, function (error) { showError(error); });
    eventBroker.subscribe(VkAppEvents.sendMessageOk, function (userId) { markAsSent(userId); });
    eventBroker.subscribe(VkAppEvents.sendMessageFailed, function (userId, error) { markAsFailed(userId, error); });

}