function SettingsController(context, apiService, initializationService, inputsHelper, eventBroker) {
    $panel = $(".settings-panel");
    var inputs = inputsHelper.for($panel);

    function refreshUi() {
        refreshImplicitFlowInfo();

        $panel.find("#applicationId").text(context.applicationId);
        inputs.setValue("#invitesInterval", context.settings.invitesInterval);
        inputs.setChecked("#debugMode", context.settings.debugMode);

        $panel.on("change", "input",
            function() {
                var settings = {
                    debugMode: inputs.getChecked("#debugMode"),
                    invitesInterval: inputs.getIntValue("#invitesInterval")
                };

                return apiService.updateSettings(settings)
                    .then(function () {
                        context.setSettings(settings);
                    }, function (error) {
                        alert(error);
                    });
            });

        $panel.find("#switchToImplicitFlow").on("click",
            function () {
                initializationService.goToImplicitFlowAuthenticationStep();
            });
    }

    function refreshImplicitFlowInfo() {
        var $implicitFlowSwitchPanel = $panel.find("#settingsImplicitFlowSwitchPanel");
        var $settingsImplicitFlowLabel = $panel.find("#settingsImplicitFlowLabel");
        if (context.implicitFlow) {
            $implicitFlowSwitchPanel.hide();
            $settingsImplicitFlowLabel.show();
        } else {
            $implicitFlowSwitchPanel.show();
            $settingsImplicitFlowLabel.hide();
        }
    }

    eventBroker.subscribe(VkAppEvents.initializationCompleted, refreshUi);
    eventBroker.subscribe(VkAppEvents.showSettings, refreshImplicitFlowInfo);
}