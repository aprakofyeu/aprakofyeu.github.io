function VkApp(applicationId) {
    //manual dependency injection region

    var urlHelper = new UrlHelper();
    var dateFormatter = new DateFormatter();
    var inputsHelper = new InputsHelper();
    var captchaService = new CaptchaService();
    var eventBroker = new EventBroker();
    var context = new AppContext(applicationId);
    var settingsController = new SettingsController(context);
    var callService = new CallService(context, captchaService);
    var storageService = new StorageService(context);
    var searchService = new SearchService(callService, storageService, context, eventBroker);
    var regionsProvider = new RegionsProvider(callService, eventBroker);
    var filtersController = new FiltersController(urlHelper, inputsHelper, searchService, regionsProvider, context, eventBroker);
    var resultsController = new ResultsController(eventBroker);
    var formatter = new MessagesFormatter();
    var progressBar = new MessageProgressBar(context);
    var messageSender = new MessageSender(context, callService, storageService, formatter, progressBar, eventBroker);
    var messagesController = new MessagesController(formatter, messageSender, formatter, urlHelper, eventBroker);
    var targetGroupsProvider = new TargetGroupsProvider(callService, storageService, urlHelper, context);
    var stepsController = new StepsController(eventBroker);
    var initializationService = new InitializationService(storageService, callService, context, dateFormatter, eventBroker);
    var initializationController = new InitializationController(initializationService, targetGroupsProvider, inputsHelper, context, eventBroker);
    var authenticationController = new AuthenticationController(initializationService, inputsHelper, urlHelper, eventBroker);
    var initializationProgressController = new InitializationProgressController(eventBroker);


    //end dependency injection

    context.baseUrl = window.location.href;

    eventBroker.publish(VkAppEvents.changeStep, VkAppSteps.authentication);

    return {
        init: function (authResponseUrl) {
            var that = this;
            var authParameters = urlHelper.parseUrlParameters(authResponseUrl);
            debugger;
            if (!authParameters) {
                alert("Не введен, либо введен неверный авторизационный токен.");
                return;
            }

            VK.init({
                apiId: applicationId
            });

            var userId = authParameters["user_id"];
            callService.init(authParameters["access_token"]);

            initializationService.iniUser(userId);
        }
    };
}

