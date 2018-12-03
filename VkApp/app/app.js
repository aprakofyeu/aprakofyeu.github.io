function VkApp() {
    var urlHelper = new UrlHelper();
    var callService = new CallService();
    var eventBroker = new EventBroker();
    var filtersController = new FiltersController(urlHelper, eventBroker);
    var searchService = new SearchService(callService, eventBroker);
    var resultsController = new ResultsController(eventBroker);
    var messagesController = new MessagesController(callService, eventBroker);


    return {
        init: function (authResponseUrl) {
            VK.init({
                apiId: 6757014
            });

            var authParameters = urlHelper.parseUrlParameters(authResponseUrl);

            this.userId = authParameters["user_id"];
            callService.init(authParameters["access_token"]);

            callService.call('users.get', { user_ids: this.userId })
                .then(function () {
                    $(".initialization").hide();
                    $(".app").show();
                    eventBroker.publish("authenticationCompleted");
                });
        }
    };
}

