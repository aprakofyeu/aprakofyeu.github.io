function AppContext(applicationId) {
    var context = {
        baseUrl: "",
        applicationId: applicationId,
        settings: {
            sendInterval: 30,
            saveLastMessage: true,
            debugMode: false,
            initializationStartPeriod: new Date(2018, 11, 6)//6 december 2018
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