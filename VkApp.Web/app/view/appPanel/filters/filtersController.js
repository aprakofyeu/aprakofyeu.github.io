function FiltersController(urlHelper, inputsHelper, searchService, regionsProvider, appContext, eventBroker) {
    if (!appContext.permissions.allowMessages)
        return;

    var $panel, $searchButton, inputs;

    function getPostParams() {
        return urlHelper.parseWallUrl(inputs.getValue("#postId"));
    }

    function isChecked(checkboxSelector) {
        return $panel.find(checkboxSelector)[0].checked;
    }

    function refreshUi() {
        $panel.find("#groupNameLabel").text(appContext.targetGroup.name);
    }

    function buildSearchParameters() {
        var parameters = {
            postInfo: getPostParams(),
            hits: inputs.getIntValue("#hitsCount")
        };

        if (isChecked("#withoutConversationsWithMeCheckbox")) {
            parameters.withoutConversationsWithMe = true;
        }

        if (isChecked("#noMessagesCheckbox")) {
            parameters.noMessagesByTargetGroup = true;
        }

        if (isChecked("#canSendMessageCheckbox")) {
            parameters.canSendMessageOnly = true;
        }

        if (isChecked("#subscriptionEnabledCheckbox")) {
            parameters.notSubscribedToTargetGroup = true;
        }

        if (isChecked("#onlineActivityRadio")) {
            parameters.onlineOnly = true;
        }

        if (isChecked("#recentActivityRadio")) {
            parameters.recenltyActivityOnly = true;
        }

        if (isChecked("#enableCountryCheckbox")) {
            parameters.country = inputs.getIntValue("#selectedCountry");
            if (isChecked("#enableCityCheckbox")) {
                parameters.city = inputs.getIntValue("#selectedCity");
            }
        }

        return parameters;
    }

    function disableSearchButton() {
        $searchButton.attr("disabled", "disabled");
    }

    function enableSearchButton() {
        $searchButton.removeAttr("disabled");
    }

    function initRegions() {
        function refreshCities() {
            var countryId = inputs.getIntValue("#selectedCountry");
            regionsProvider.getCities(countryId).then(function (cities) {
                inputsHelper.renderOptions(
                    $panel.find("#selectedCity"),
                    cities.items,
                    function (x) { return x.id; },
                    function (x) { return x.title; },
                    function (x) { return x.important; });
            });
        }

        refreshCities();

        $panel.find("#selectedCountry").on("change", function () {
            refreshCities();
        });

    }


    function initView() {
        $panel = $(".filter-panel");
        $searchButton = $panel.find("#searchButton");
        inputs = inputsHelper.for($panel);

        function refreshRowForCheckbox($checkbox) {
            var row = $checkbox.closest(".row");
            if ($checkbox[0].checked) {
                row.removeClass("disabled");
            } else {
                row.addClass("disabled");
            }
        }

        function isValid() {
            if (!getPostParams()) {
                inputs.markAsInvalid("#postId");
                return false;
            }

            return true;
        }

        function initRowDisabling(checkboxId) {
            var $checkbox = $panel.find("#" + checkboxId);
            refreshRowForCheckbox($checkbox);
            $checkbox.on("change", function () {
                refreshRowForCheckbox($checkbox);
            });
        }

        initRowDisabling("subscriptionEnabledCheckbox");
        //initRowDisabling("withoutConversationsWithMeCheckbox");
        initRowDisabling("noMessagesCheckbox");
        initRowDisabling("canSendMessageCheckbox");
        initRowDisabling("enableCountryCheckbox");
        initRowDisabling("enableCityCheckbox");

        $panel.find("#searchButton").on("click",
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
        eventBroker.subscribe(VkAppEvents.authenticationCompleted, function () { initRegions(); });
        eventBroker.subscribe(VkAppEvents.initializationCompleted, function () { refreshUi(); });
    }

    initView();
    initEvents();
}