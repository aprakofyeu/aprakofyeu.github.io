function FiltersController(urlHelper, searchService, regionsProvider, eventBroker) {
    var $panel, $searchButton;

    function getPostParams() {
        return urlHelper.parseWallUrl($panel.find("#postId").val());
    }

    function getSubscribedGroupId() {
        return urlHelper.getPublicId($panel.find("#subscriptionInput").val());
    }

    function isChecked(checkboxSelector) {
        return $panel.find(checkboxSelector)[0].checked;
    }

    function markAsInvalid(selector) {
        $panel.find(selector).addClass("invalid");
    }

    function getValue(checkbox) {
        return parseInt($panel.find(checkbox).val());
    }

    function buildSearchParameters() {
        var parameters = {
            postInfo: getPostParams(),
            hits: getValue("#hitsCount")
        };

        if (isChecked("#withoutConversationsWithMeCheckbox")) {
            parameters.withoutConversationsWithMe = true;
        }

        if (isChecked("#canSendMessageCheckbox")) {
            parameters.canSendMessageOnly = true;
        }

        if (isChecked("#subscriptionEnabledCheckbox")) {
            parameters.notSubscribedToPublic = getSubscribedGroupId();
        }

        if (isChecked("#onlineOnlyCheckbox")) {
            parameters.onlineOnly = true;
        }

        if (isChecked("#enableCountryCheckbox")) {
            parameters.country = getValue("#selectedCountry");
            if (isChecked("#enableCityCheckbox")) {
                parameters.city = getValue("#selectedCity");
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
            var countryId = $panel.find("#selectedCountry").val();
            regionsProvider.getCities(countryId).then(function (cities) {
                var optionsHtml = cities.items.map(function (city) {
                    return "<option value='" + city.id + "'" + (city.important ? " selected='selected'" : "") + ">" + city.title + "</option>";
                }).join("");
                $panel.find("#selectedCity").html(optionsHtml);
            });
        }

        refreshCities();

        $panel.find("#selectedCountry").on("change", function () {
            refreshCities();
        });

    }


    function initView() {
        $panel = $(".panel.filter");
        $searchButton = $panel.find("#searchButton");

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
                markAsInvalid("#postId");
                return false;
            }

            if (isChecked("#subscriptionEnabledCheckbox") && !getSubscribedGroupId()) {
                markAsInvalid("#subscriptionInput");
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
        initRowDisabling("withoutConversationsWithMeCheckbox");
        initRowDisabling("canSendMessageCheckbox");
        initRowDisabling("onlineOnlyCheckbox");
        initRowDisabling("enableCountryCheckbox");
        initRowDisabling("enableCityCheckbox");

        initRegions();

        $panel.find("input").on("change", function () {
            $(this).removeClass("invalid");
        });

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
    }

    initView();
    initEvents();
}