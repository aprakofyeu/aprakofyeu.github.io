function FiltersController(urlHelper, inputsHelper, searchService, geoFilterController, appContext, eventBroker) {
    if (!appContext.permissions.allowMessages)
        return;

    var $panel, $searchButton, inputs, geoFilter;

    function getPostParams() {
        return urlHelper.parseWallUrl(inputs.getValue("#postId"));
    }

    function refreshUi() {
        $panel.find("#groupNameLabel").text(appContext.targetGroup.name);
        geoFilter = geoFilterController.init($panel.find(".geo-filter"));
    }

    function buildSearchParameters() {
        var parameters = {
            postInfo: getPostParams(),
            hits: inputs.getIntValue("#hitsCount")
        };

        if (inputs.getChecked("#noMessagesCheckbox")) {
            parameters.noMessagesByTargetGroup = true;
        }

        if (inputs.getChecked("#canSendMessageCheckbox")) {
            parameters.canSendMessageOnly = true;
        }

        if (inputs.getChecked("#subscriptionEnabledCheckbox")) {
            parameters.notSubscribedToTargetGroup = true;
        }

        if (inputs.getChecked("#onlineActivityRadio")) {
            parameters.onlineOnly = true;
        }

        if (inputs.getChecked("#recentActivityRadio")) {
            parameters.recenltyActivityOnly = true;
        }

        var geoSelections = geoFilter.getSelections();
        $.extend(parameters, geoSelections);

        return parameters;
    }

    function disableSearchButton() {
        $searchButton.attr("disabled", "disabled");
    }

    function enableSearchButton() {
        $searchButton.removeAttr("disabled");
    }

    function initView() {
        $panel = $(".filter-panel");
        $searchButton = $panel.find("#searchButton");
        inputs = inputsHelper.for($panel);

        function isValid() {
            if (!getPostParams()) {
                inputs.markAsInvalid("#postId");
                return false;
            }

            return true;
        }

        inputsHelper.initRowDisabling($panel.find("#subscriptionEnabledCheckbox"));
        inputsHelper.initRowDisabling($panel.find("#noMessagesCheckbox"));
        inputsHelper.initRowDisabling($panel.find("#canSendMessageCheckbox"));

        $searchButton.on("click",
            function () {
                if (isValid()) {
                    var searchParameters = buildSearchParameters();
                    searchService.search(searchParameters);
                }
            });
    }

    function initEvents() {
        eventBroker.subscribe(VkAppEvents.search, function () { disableSearchButton(); });
        eventBroker.subscribe(VkAppEvents.searchCompleted, function () { enableSearchButton(); });
        eventBroker.subscribe(VkAppEvents.searchFailed, function () { enableSearchButton(); });
        eventBroker.subscribe(VkAppEvents.initializationCompleted, function () { refreshUi(); });
    }

    initView();
    initEvents();
}