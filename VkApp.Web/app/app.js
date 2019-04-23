function VkApp(applicationId) {
    //manual dependency injection region

    var urlHelper = new UrlHelper();
    var dateFormatter = new DateFormatter();
    var inputsHelper = new InputsHelper();
    var progressBarHelper = new ProgressBarHelper();
    var captchaService = new CaptchaService();
    var eventBroker = new EventBroker();
    var context = new AppContext(applicationId);
    var apiService = new ApiService(context);
    var callService = new CallService(context, captchaService);
    var searchService = new SearchService(callService, apiService, context, eventBroker);
    var regionsProvider = new RegionsProvider(callService, eventBroker);
    var formatter = new MessagesFormatter();
    var progressBar = new MessageProgressBar(context);
    var messageSender = new MessageSender(context, callService, apiService, formatter, progressBar, eventBroker);
    var targetGroupsProvider = new TargetGroupsProvider(callService, apiService, urlHelper, context);
    var initializationService = new InitializationService(apiService, callService, context, dateFormatter, eventBroker);
    var statisticsService = new StatisticsService(apiService, callService, context, eventBroker);

    var settingsController = new SettingsController(context, apiService, inputsHelper, eventBroker);
    var filtersController = new FiltersController(urlHelper, inputsHelper, searchService, regionsProvider, context, eventBroker);
    var messagesController = new MessagesController(formatter, messageSender, apiService, urlHelper, context, eventBroker);
    var manualMessageSender = new ManualMessageSender(context, messagesController, formatter, apiService, eventBroker);
    var resultsController = new ResultsController(manualMessageSender, eventBroker);
    var stepsController = new StepsController(eventBroker);
    var initializationController = new InitializationController(initializationService, targetGroupsProvider, inputsHelper, context, eventBroker);
    var authenticationController = new AuthenticationController(initializationService, inputsHelper, urlHelper, eventBroker);
    var initializationProgressController = new InitializationProgressController(progressBarHelper, eventBroker);
    var appPanelController = new AppPanelController(eventBroker);
    var statisticsPanelController = new StatisticsPanelController(statisticsService, progressBarHelper, eventBroker);
    var instrumentsPanelController = new InstrumentsPanelController(urlHelper, inputsHelper, callService, context, eventBroker);


    //end dependency injection

    context.baseUrl = window.location.href;

    eventBroker.publish(VkAppEvents.changeStep, VkAppSteps.authentication);

    return {
        init: function (authResponseUrl) {
            var authParameters = urlHelper.parseUrlParameters(authResponseUrl);
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

