function CleanupFriendsController(invitesService, inputsHelper, progressBarHelper, context, eventBroker) {
    if (!context.permissions.allowInstruments)
        return;

    var $panel = $(".cleanup-friends-panel");
    var $cleanupButton = $panel.find(".cleanupButton");
    var inputs = inputsHelper.for($panel);

    var initialized = false;
    var dataLoaded = false;
    var friendsInfo = null;
    var noActivityFriends = [];
    var progressBar = null;

    function initUi() {
        invitesService.loadFriendsInfo().then(function (result) {
            friendsInfo = result;
            dataLoaded = true;

            initFriendsInfo();
            refreshUi();
        });
    }

    function refreshUi() {
        if (!initialized) {
            initUi();
            initialized = true;
        }

        if (context.implicitFlow && dataLoaded) {
            inputs.enable(".cleanupButton");
        } else {
            inputs.disable(".cleanupButton");
        }
    }

    function onError(error) {
        $panel.find(".summary.fail")
            .html("Ошибка: " + error)
            .show();

        $panel.find("#cleanupFriendsStatusBar").hide();
        $cleanupButton.show();
        initUi();
    }

    function initFriendsInfo() {
        $panel.find("#cleanupInitialLoader").hide();
        $panel.find(".cleanup-friends-actions-panel").show();

        var now = new Date();
        var yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        noActivityFriends = friendsInfo.getFriendsLastSeenLessThan(yearAgo);

        $panel.find(".deletedFriendsCountLabel").text(friendsInfo.deactivatedFriends.deleted.length);
        $panel.find(".bannedFriendsCountLabel").text(friendsInfo.deactivatedFriends.banned.length);
        $panel.find(".noActivityFriendsCountLabel").text(noActivityFriends.length);


        $panel.find(".deletedFriendsDetailsLink").on("click",
            function() {
                showFriendsDetails(friendsInfo.deactivatedFriends.deleted);
            });

        $panel.find(".bannedFriendsDetailsLink").on("click",
            function() {
                showFriendsDetails(friendsInfo.deactivatedFriends.banned);
            });

        $panel.find(".noActivityFriendsDetailsLink").on("click",
            function() {
                showFriendsDetails(noActivityFriends);
            });
    }

    function showFriendsDetails(friends) {

        for (var i = 0; i < friends.length; i++) {
            var friend = friends[i];
            if (friend.last_seen && friend.last_seen.time) {
                friend.last_seen_formatted = new Date(friend.last_seen.time * 1000).toLocaleDateString();
            }
        }

        var content = $panel.find("#friendsDetailsTemplate").tmpl({ friends: friends });
        var $dialog = $(content).dialog({
            modal: true,
            minWidth: 450,
            minHeight: 300,
            maxHeight: 600,
            buttons: {
                "Закрыть": function() {
                    $dialog.dialog("close");
                }
            }
        });
    }

    $cleanupButton.on("click",
        function () {
            if (context.implicitFlow) {
                $panel.find(".summary").empty().hide();

                var usersToDelete = [];

                if (inputs.getChecked(".deletedFriendsCheckbox")) {
                    usersToDelete = usersToDelete.concat(friendsInfo.deactivatedFriends.deleted);
                }
                if (inputs.getChecked(".bannedFriendsCheckbox")) {
                    usersToDelete = usersToDelete.concat(friendsInfo.deactivatedFriends.banned);
                }
                if (inputs.getChecked(".noActivityFriendsCheckbox")) {
                    usersToDelete = usersToDelete.concat(noActivityFriends);
                }

                if (!usersToDelete.length) {
                    alert("Не выбраны друзья для удаления");
                    return;
                }

                initProgressBar(usersToDelete);
                invitesService.deleteFriends(usersToDelete);
            }
        });

    function initProgressBar(usersToDelete) {
        $cleanupButton.hide();

        var $progressBarElement = $panel.find("#cleanupFriendsStatusBar");
        $progressBarElement.show();

        progressBar = progressBarHelper.create({
            element: $progressBarElement,
            totalCount: usersToDelete.length,
            completeLabel: "Все выбранные друзья удалены!"
        });
    }

    function increaseProgressBar() {
        if (progressBar) {
            progressBar.updateStatus();
        }
    }

    function onDeleteFriendsCompleted() {
        $cleanupButton.show();
        initUi();
    }

    eventBroker.subscribe(VkAppEvents.showInstruments, function () { refreshUi(); });
    eventBroker.subscribe(VkAppEvents.deleteFriendSuccess, function () { increaseProgressBar(); });
    eventBroker.subscribe(VkAppEvents.deleteFriendsCompleted, function () { onDeleteFriendsCompleted(); });
    eventBroker.subscribe(VkAppEvents.deleteFriendError, function (friend, error) { onError(error); });

}