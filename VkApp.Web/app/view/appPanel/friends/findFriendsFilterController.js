function FindFriendsFilterController(inputsHelper, urlHelper, cachedFriendRequestsDataLoader, friendsSearchService, geoFilterController, context, eventBroker) {
    if (!context.permissions.allowFindFriends)
        return;

    var $panel = $(".find-friends-filter");
    var $searchButton = $panel.find(".searchButton");
    var inputs = inputsHelper.for($panel);
    var geoFilter;

    function initUi() {
        inputsHelper.initRowDisabling($panel.find(".subscriptionEnabledCheckbox"), $panel.find(".subscriptionEnabledCheckboxLabel"));
        inputsHelper.initRowDisabling($panel.find(".noMessagesCheckbox"), $panel.find(".noMessagesCheckboxLabel"));
        inputsHelper.initRowDisabling($panel.find(".notInColleagueFriendsCheckbox"), $panel.find(".notInColleagueFriendsCheckboxLabel"));
        inputsHelper.initRowDisabling($panel.find(".canFriendsRequestCheckbox"), $panel.find(".canFriendsRequestCheckboxLabel"));
        inputsHelper.initRowDisabling($panel.find(".noFriendRequestedLastTimeCheckbox"), $panel.find(".noFriendRequestedLastTimeCheckboxLabel"));

        $searchButton.on("click",
            function () {
                if (isValid()) {
                    var searchParameters = buildSearchParameters();
                    friendsSearchService.search(searchParameters);
                }
            });
    }

    function initFriendsCount() {
        cachedFriendRequestsDataLoader.getColleagueFriends()
            .then(function (friends) {
                var count = 0;
                for (var friend in friends) {
                    if (friends.hasOwnProperty(friend)) {
                        count++;
                    }
                }

                $panel.find(".totalFriendsCount").html("(Всего <b>" + count+ "</b> друзей)");
            }, function (error) {
                $panel.find(".totalFriendsCount").empty();
                $panel.find(".fail")
                    .html("Не удалось загрузить список друзей...<br/>Ошибка: " + error)
                    .show();
            });
    }

    function refreshUi() {
        if (context.implicitFlow) {
            inputs.enable(".searchButton");
        } else {
            inputs.disable(".searchButton");
        }

        if (!geoFilter) {
            geoFilter = geoFilterController.init($panel.find(".geo-filter"));
        }
        $panel.find(".groupNameLabel").text(context.targetGroup.name);
        $panel.find(".friendRequestsIntervalLabel").text(context.settings.friendRequestsInterval);
    }

    function getPostParams() {
        return urlHelper.parseWallUrl(inputs.getValue(".post-id"));
    }

    function buildSearchParameters() {
        var parameters = {
            postInfo: getPostParams(),
            hits: inputs.getIntValue(".hitsCount")
        };

        if (inputs.getChecked(".subscriptionEnabledCheckbox")) {
            parameters.notSubscribedToTargetGroup = true;
        }

        if (inputs.getChecked(".noMessagesCheckbox")) {
            parameters.noMessagesByTargetGroup = true;
        }

        if (inputs.getChecked(".canFriendsRequestCheckbox")) {
            parameters.canFriendsRequest = true;
        }

        if (inputs.getChecked(".notInColleagueFriendsCheckbox")) {
            parameters.notInColleagueFriends = true;
        }

        if (inputs.getChecked(".noFriendRequestedLastTimeCheckbox")) {
            parameters.noFriendRequestedLastTime = true;
        }

        var geoSelections = geoFilter.getSelections();
        $.extend(parameters, geoSelections);

        return parameters;
    }

    function isValid() {
        if (!getPostParams()) {
            inputs.markAsInvalid(".post-id");
            return false;
        }

        return true;
    }

    function disableSearchButton() {
        $searchButton.attr("disabled", "disabled");
    }

    function enableSearchButton() {
        $searchButton.removeAttr("disabled");
    }



    initUi();

    eventBroker.subscribe(VkAppEvents.showFindFriends, function () { refreshUi(); });
    eventBroker.subscribe(VkAppEvents.search, function () { disableSearchButton(); });
    eventBroker.subscribe(VkAppEvents.searchCompleted, function () { enableSearchButton(); });
    eventBroker.subscribe(VkAppEvents.searchFailed, function () { enableSearchButton(); });
    eventBroker.subscribe(VkAppEvents.initializationCompleted, function () { initFriendsCount(); });

}