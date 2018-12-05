function FiltersController(urlHelper, eventBroker) {
    var $panel;

    function getPostParams() {
        return urlHelper.parsePostUrl($panel.find("#postId").val());
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

    function buildSearchParameters() {
        var parameters = {
            postInfo: getPostParams(),
            hits: parseInt($panel.find("#hitsCount").val())
        };

        if (isChecked("#withoutConversationsWithMe")) {
            parameters.withoutConversationsWithMe = true;
        }

        if (isChecked("#canSendMessage")) {
            parameters.canSendMessageOnly = true;
        }

        if (isChecked("#subscriptionEnabledCheckbox")) {
            parameters.notSubscribedToPublic = getSubscribedGroupId();
        }

        return parameters;
    }


    function initView() {
        $panel = $(".panel.filter");

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

            if (isChecked("#withoutConversationsWithMe") && !getSubscribedGroupId()) {
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
        initRowDisabling("withoutConversationsWithMe");
        initRowDisabling("canSendMessage");

        $panel.find("input").on("change", function() {
            $(this).removeClass("invalid");
        });

        $panel.find("#searchButton").on("click",
            function () {
                if (isValid()) {
                    var searchParameters = buildSearchParameters();
                    eventBroker.publish(VkAppEvents.search, searchParameters);
                }
            });
    }

    initView();
}