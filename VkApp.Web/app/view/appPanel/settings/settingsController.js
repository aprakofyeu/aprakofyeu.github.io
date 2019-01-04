function SettingsController(context, apiService, inputsHelper, eventBroker) {
    $panel = $(".settings-panel");
    var inputs = inputsHelper.for($panel);

    function refreshUi() {
        $panel.find("#applicationId").text(context.applicationId);
        inputs.setValue("#timeInterval", context.settings.sendInterval);
        inputs.setChecked("#saveLastMessage", context.settings.saveLastMessage);
        inputs.setChecked("#debugMode", context.settings.debugMode);

        $panel.on("change", "input",
            function() {
                var settings = {
                    sendInterval: inputs.getIntValue("#timeInterval"),
                    saveLastMessage: inputs.getChecked("#saveLastMessage"),
                    debugMode: inputs.getChecked("#debugMode")
                };

                return apiService.updateSettings(settings)
                    .then(function () {
                        context.setSettings(settings);
                    }, function (error) {
                        alert(error);
                    });
            });
    }

    eventBroker.subscribe(VkAppEvents.initializationCompleted, refreshUi);
}