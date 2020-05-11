function FindFriendsResultsController(inputsHelper, friendRequestService, progressBarHelper, context, eventBroker) {
    var $panel = $(".find-friends-results-panel");
    var $results = $panel.find(".result-users");
    var inputs = inputsHelper.for($panel);
    var friendsRequestsInProgress = false;
    var progressBar, foundUsers;

    function refreshActionsUi() {
        if (context.implicitFlow && !friendsRequestsInProgress && getAvailableToFriendRequestUserIds().length > 0) {
            inputs.enable(".addAllButton");
        } else {
            inputs.disable(".addAllButton");
        }
    }

    function showSearchError(error) {
        refreshActionsUi();

        $results.empty();
        $panel.find(".summary.fail")
            .html("Опачки... Во время поиска что-то пошло не так...<br/>Ошибка: "
                + error
                + "<br/>Попробуйте еще раз")
            .show();
    }

    function showFriendRequestError(userId, error) {
        friendsRequestsInProgress = false;
        hideProgressBar();
        refreshActionsUi();
        refreshUsersList();
        $panel.find(".summary.fail")
            .html("Oops... Не удается добавить userId=" + userId + " в друзья..<br/>Ошибка: " + error)
            .show();
    }

    function showLoader() {
        hideSummary();
        $results.html("<div class='loader'></div>");
    }

    function refreshUsersList() {
        var $users = $panel.find("#findFriendsUsersTemplate").tmpl(foundUsers);
        $results.html($users);
    }

    function renderUsers(users) {
        if (users && users.length > 0) {
            foundUsers = users.map(function (user) {
                //should be explicit defined to avoid template errors
                user.friendRequested = !!user.friendRequested;
                user.can_send_friend_request = !!user.can_send_friend_request;
                return user;
            });
            refreshUsersList();
        } else {
            $results.html("К сожалению, поиск не дал результатов...");
        }

        refreshActionsUi();
    }

    function hideSummary() {
        $panel.find(".summary").empty().hide();
    }

    function getUserStatusPanel(userId) {
        return $results.find("[user-id=" + userId + "] .status-panel");
    }

    function getUser(userId) {
        return foundUsers.find(function (user) { return user.id === userId; });
    }

    function markAsFriendRequested(userId) {
        progressBar.updateStatus();

        var user = getUser(userId);
        if (user) {
            user.friendRequested = true;
        }

        $results.find("button[user-id=" + userId + "]").hide();
        getUserStatusPanel(userId).append("<div class='ok' title='Заявка отправлена!'></div>");

        refreshActionsUi();
    }

    function initProgressBar(userIds) {
        $panel.find(".actions-panel").hide();
        $panel.find(".progress-panel").show();
        progressBar = progressBarHelper.create({
            totalCount: userIds.length,
            element: $panel.find(".statisticsStatusBar"),
            completeLabel: "Заявки в друзья разоссланы успешно!"
        });
    }

    function hideProgressBar() {
        $panel.find(".actions-panel").show();
        $panel.find(".progress-panel").hide();
    }

    function addFriendsStarted(userIds) {
        hideSummary();
        initProgressBar(userIds);
        friendsRequestsInProgress = true;
        refreshActionsUi();
    }

    function addFriendsCompleted() {
        friendsRequestsInProgress = false;
        hideProgressBar();
        refreshActionsUi();
        refreshUsersList();
        $panel.find(".summary.info")
            .html("Заявки в друзья разоссланы успешно!")
            .show();
    }

    function getAvailableToFriendRequestUserIds() {
        return foundUsers
            ? foundUsers
                .filter(function (user) { return !user.friendRequested; })
                .map(function (user) { return user.id; })
            : [];
    }

    $results.on("click", ".send-friend-request_button", function () {
        if (!friendsRequestsInProgress && !$(this).attr("disabled")) {
            var userId = parseInt($(this).attr("user-id"));
            var user = getUser(userId);
            if (user && !user.friendRequested) {
                friendRequestService.addFriends([userId]);
            }
        }
    });

    $panel.find(".addAllButton").on("click", function () {
        if (!friendsRequestsInProgress) {

            var userIds = getAvailableToFriendRequestUserIds();

            if (userIds.length > 0) {

                $results.find(".send-friend-request_button").hide();

                friendRequestService.addFriends(userIds);
            } else {
                var $dialog = $("<div>К сожалению, отправить заявку некому. Повторите поиск...</div>").dialog({
                    modal: true,
                    width: 600,
                    title: "Внимание!",
                    buttons: {
                        "Закрыть": function () {
                            $dialog.dialog("destroy");
                        }
                    }
                });
            }
        }
    });

    eventBroker.subscribe(VkAppEvents.showFindFriends, function () { refreshActionsUi(); });
    eventBroker.subscribe(VkAppEvents.searchFriends, function () { showLoader(); });
    eventBroker.subscribe(VkAppEvents.searchFriendsCompleted, function (users) { renderUsers(users); });
    eventBroker.subscribe(VkAppEvents.searchFriendsFailed, function (error) { showSearchError(error); });
    eventBroker.subscribe(VkAppEvents.addFriendError, function (userId, error) { showFriendRequestError(userId, error); });
    eventBroker.subscribe(VkAppEvents.addFriendSuccess, function (userId) { markAsFriendRequested(userId); });
    eventBroker.subscribe(VkAppEvents.addFriendsStart, function (userIds) { addFriendsStarted(userIds); });
    eventBroker.subscribe(VkAppEvents.addFriendsCompleted, function () { addFriendsCompleted(); });
}