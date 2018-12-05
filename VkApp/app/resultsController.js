function ResultsController(eventBroker) {
    var $panel = $(".results");

    function renderUsers(users) {
        var $users = $("#usersTemplate").tmpl(users);
        $panel.html($users);
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

    eventBroker.subscribe(VkAppEvents.searchCompleted, function (users) { renderUsers(users); });
    eventBroker.subscribe(VkAppEvents.sendMessageOk, function (userId) { markAsSent(userId); });
    eventBroker.subscribe(VkAppEvents.sendMessageFailed, function (userId, error) { markAsFailed(userId, error); });
}