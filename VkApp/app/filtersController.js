function FiltersController(urlHelper, eventBroker) {
    var $panel;

    function buildSearchParameters() {
        var parameters = {
            postInfo: urlHelper.parsePostUrl($("#postId").val()),
            hits: parseInt($("#hitsCount").val())
        };

        if ($("#withoutConversationsWithMe")[0].checked) {
            parameters.withoutConversationsWithMe = true;
        }

        if ($("#canSendMessage")[0].checked) {
            parameters.canSendMessageOnly = true;
        }

        if ($("#subscriptionEnabledCheckbox")[0].checked) {

            var publicId = urlHelper.getPublicId($("#subscriptionInput").val());
            parameters.notSubscribedToPublic = publicId;
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

        $panel.find("#subscriptionEnabledCheckbox").on("change",
            function () {
                $panel.find("#subscriptionInput").toggle();
            });

        $panel.find("#searchButton").on("click",
            function () {
                var searchParameters = buildSearchParameters();
                eventBroker.publish(VkAppEvents.search, searchParameters);
            });
    }

    initView();
}