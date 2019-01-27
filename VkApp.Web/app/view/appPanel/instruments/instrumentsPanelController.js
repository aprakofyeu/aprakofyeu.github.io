function InstrumentsPanelController(urlHelper, inputsHelper, callService, context, eventBroker) {
    var $panel = $(".instruments-panel");
    var inputs = inputsHelper.for($panel);

    function showError(error) {
        $panel.find(".summary.fail")
            .html("Ошибка: " + error)
            .show();
    }

    function showOkResult(user) {
        $panel.find(".summary.info")
            .html(user.first_name + " " + user.last_name + " <b>подписан" + (user.sex === 1 ? "а" : "") + "!:)</b>")
            .show();
    }

    function showNoResult(user) {
        $panel.find(".summary.warning")
            .html(user.first_name + " " + user.last_name + " <b>не подписан" + (user.sex === 1 ? "а" : "") + " :((</b>")
            .show();
    }

    function hideAllSummaries() {
        $panel.find(".summary").empty().hide();
    }

    function refreshUi() {
        $panel.find("#groupNameLabel").text(context.targetGroup.name);
        inputs.clear("#userIdOrUrlInput");
        hideAllSummaries();
    }

    $panel.find("#checkButton").on("click",
        function () {
            hideAllSummaries();

            var userId = urlHelper.getUserId(inputs.getValue("#userIdOrUrlInput"));

            if (!userId) {
                inputs.markAsInvalid("#userIdOrUrlInput");
                return;
            }

            callService.call("users.get", { user_ids: userId, fields: "sex" })
                .then(function (response) {
                    if (response.length > 0) {
                        var user = response[0];
                        callService
                            .call('groups.isMember', { group_id: context.targetGroup.id, user_ids: user.id })
                            .then(function (results) {
                                if (results[0].member) {
                                    showOkResult(user);
                                } else {
                                    showNoResult(user);
                                }
                            }, function (error) {
                                showError(error);
                            });
                    }

                }, function (error) {
                    showError(error);
                });
        });

    eventBroker.subscribe(VkAppEvents.showInstruments, function () { refreshUi(); });
}