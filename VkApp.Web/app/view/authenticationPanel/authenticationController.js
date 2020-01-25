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

    $panel.find("#loginButton").click(function () {
        clearErrors();
        inputs.disable("#initAppButton");
        initializationService.initApplicationByVkLogin();
    });

    eventBroker.subscribe(VkAppEvents.authenticationError, function(error) { showError(error); });
}