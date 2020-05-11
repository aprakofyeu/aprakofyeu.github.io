function VkApp(applicationId, permissions) {
    //manual dependency injection region
    var urlHelper = new UrlHelper();
    var inputsHelper = new InputsHelper();
    var progressBarHelper = new ProgressBarHelper();
    var captchaService = new CaptchaService();
    var eventBroker = new EventBroker();
    var context = new AppContext(applicationId, permissions);
    var apiService = new ApiService(context);
    var callService = new CallService(context, captchaService);
    var searchHelper = new SearchHelper(callService, apiService, context);
    var searchService = new SearchService(searchHelper, context, eventBroker);
    var cachedFriendRequestsDataLoader = new CachedFriendRequestsDataLoader(apiService, callService, context);
    var friendsSearchService = new FriendsSearchService(searchHelper, cachedFriendRequestsDataLoader, apiService, eventBroker);
    var regionsProvider = new RegionsProvider(callService, eventBroker);
    var formatter = new MessagesFormatter();
    var progressBar = new MessageProgressBar(context);
    var messageSender = new MessageSender(context, callService, apiService, formatter, progressBar, eventBroker);
    var targetGroupsProvider = new TargetGroupsProvider(callService, apiService, urlHelper, context);
    var initializationService = new InitializationService(apiService, callService, context, eventBroker);
    var groupUsersDataLoader = new GroupUsersDataLoader(context, callService);
    var cachedStatisticsDataLoader = new CachedStatisticsDataLoader(groupUsersDataLoader, apiService, eventBroker);
    var statisticsService = new StatisticsService(cachedStatisticsDataLoader);
    var invitesService = new InvitesService(groupUsersDataLoader, context, callService, apiService, eventBroker);
    var friendRequestService = new FriendRequestService(callService, apiService, eventBroker);

    var geoFilterController = new GeoFilterController(inputsHelper, regionsProvider);
    var settingsController = new SettingsController(context, apiService, initializationService, inputsHelper, eventBroker);
    var filtersController = new FiltersController(urlHelper, inputsHelper, searchService, geoFilterController, context, eventBroker);
    var messagesController = new MessagesController(formatter, messageSender, apiService, urlHelper, context, eventBroker);
    var manualMessageSender = new ManualMessageSender(context, messagesController, formatter, apiService, eventBroker);
    var resultsController = new ResultsController(manualMessageSender, eventBroker);
    var stepsController = new StepsController(eventBroker);
    var initializationController = new InitializationController(initializationService, targetGroupsProvider, inputsHelper, context, eventBroker);
    var authenticationController = new AuthenticationController(initializationService, inputsHelper, urlHelper, eventBroker);
    var implicitFlowAuthenticationController = new ImplicitFlowAuthenticationController(initializationService, inputsHelper, urlHelper, eventBroker);
    var appPanelController = new AppPanelController(eventBroker);
    var statisticsPanelController = new StatisticsPanelController(statisticsService, context, inputsHelper, progressBarHelper, eventBroker);
    var instrumentsPanelController = new InstrumentsPanelController(urlHelper, inputsHelper, callService, context, eventBroker);
    var invitesPanelController = new InvitesPanelController(initializationService, inputsHelper, invitesService, callService, context, eventBroker);
    var findFriendsFilterController = new FindFriendsFilterController(inputsHelper, urlHelper, cachedFriendRequestsDataLoader, friendsSearchService, geoFilterController, context, eventBroker);
    var findFriendsResultsController = new FindFriendsResultsController(inputsHelper, friendRequestService, progressBarHelper, context, eventBroker);
    var implicitFlowSwitcherController = new ImplicitFlowSwitcherController(initializationService, context, eventBroker);


    //end dependency injection

    context.baseUrl = window.location.href;

    initializationService.goToAuthenticationStep();

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

