﻿function AppContext(eventBroker) {
    var context = {
        settings: {
            messagesInterval: 30,
            debugMode: false
        }
    };

    eventBroker.subscribe(VkAppEvents.authenticationCompleted, function (user) {
        context.user = user;
        context.searchResult = {};
    });

    eventBroker.subscribe(VkAppEvents.searchCompleted, function (users) {
        context.searchResult.users = users;
    });

    return context;
}