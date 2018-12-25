function AppContext(applicationId) {
    var context = {
        baseUrl: "",
        applicationId: applicationId,
        settings: {
            messagesInterval: 30,
            debugMode: false,
            initializationStartPeriod: new Date(2018, 11, 6)//6 december 2018
        },
        searchResult: {},
        conversations: {
            users: {}
        },

        setUser: function (user) {
            this.user = user;
        },

        setInitializationInfo: function (initializationInfo) {
            this.user.messagesInitialized = initializationInfo.messagesInitialized;

            if (initializationInfo.preferredGroup > 0) {
                this.user.preferredGroup = initializationInfo.preferredGroup;
            }
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