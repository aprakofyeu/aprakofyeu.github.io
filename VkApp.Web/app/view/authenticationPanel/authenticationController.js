function AuthenticationController(initializationService, inputsHelper, urlHelper, eventBroker) {
    var $panel = $(".authentication");
    var inputs = inputsHelper.for($panel);

    function showError(error) {
        $panel.find(".summary")
            .html("Во время авторизации что-то пошло не так=((<br/>Ошибка: " + error)
            .show();

        inputs.enable("#initAppButton");
    }

    function clearErrors() {
        $panel.find(".summary").empty().hide();
    }

    $panel.find("#initAppButton").click(function () {
        clearErrors();
        inputs.disable("#initAppButton");

        var authValue = inputs.getValue("#authResultInput");
        var authParameters = urlHelper.parseUrlParameters(authValue);
        if (!authParameters) {
            inputs.markAsInvalid("#authResultInput");
            showError("Не введен, либо введен неверный авторизационный токен.");
            return;
        }

        initializationService.initApplication(authParameters["access_token"]);
        initializationService.initUser();
    });

    eventBroker.subscribe(VkAppEvents.authenticationError, function(error) { showError(error); });
}