function VkApp() {
    //dependency injection region

    var urlHelper = new UrlHelper();
    var captchaService = new CaptchaService();
    var eventBroker = new EventBroker();
    var context = new AppContext(eventBroker);
    var settingsController = new SettingsController(context);
    var callService = new CallService(context, captchaService);
    var searchService = new SearchService(callService, eventBroker);
    var regionsProvider = new RegionsProvider(callService, eventBroker);
    var filtersController = new FiltersController(urlHelper, searchService, regionsProvider, eventBroker);
    var resultsController = new ResultsController(eventBroker);
    var formatter = new MessagesFormatter();
    var progressBar = new MessageProgressBar(context);
    var messageSender = new MessageSender(context, callService, formatter, progressBar, eventBroker);
    var messagesController = new MessagesController(formatter, messageSender, formatter, urlHelper, eventBroker);

    //end dependency injection


    return {
        init: function (authResponseUrl) {
            var that = this;
            var authParameters = urlHelper.parseUrlParameters(authResponseUrl);

            if (!authParameters) {
                alert("Не введен, либо введен неверный авторизационный токен.");
                return;
            }

            VK.init({
                apiId: 6786478
            });

            this.userId = authParameters["user_id"];
            callService.init(authParameters["access_token"]);

            callService.call('users.get', { user_ids: this.userId })
                .then(function (response) {
                    that.user = response[0];
                    $(".initialization").hide();
                    $(".app").show();
                    eventBroker.publish(VkAppEvents.authenticationCompleted, that.user);
                });
        }
    };
}

