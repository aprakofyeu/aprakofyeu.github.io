﻿function AppContext(applicationId) {
    var context = {
        baseUrl: "",
        applicationId: applicationId,
        maxMessagesCount: 5,
        settings: {
            sendInterval: 30,
            saveLastMessage: true,
            debugMode: false
        },
        searchResult: {},
        conversations: {
            users: {}
        },

        setUser: function (user, userSettings) {
            this.user = user;

            this.user.messagesInitialized = userSettings.messagesInitialized;
            this.user.preferredGroup = userSettings.preferredGroup;
        },

        setSettings: function (settings) {
            this.settings.sendInterval = settings.sendInterval;
            this.settings.saveLastMessage = settings.saveLastMessage;
            this.settings.debugMode = !!settings.debugMode;
        },

        setTargetGroup: function (group) {
            this.targetGroup = group;
        },

        setSearchResultUsers: function (users) {
            this.searchResult.users = users;
        },

        addConversationUserId: function (userId) {
            this.conversations.users[userId] = true;
        },

        hasConversationsWithUser: function (userId) {
            return this.conversations.users[userId] ? true : false;
        }
    };

    return context;
}