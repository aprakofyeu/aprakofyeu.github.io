function AppContext(applicationId, permissions) {
    var context = {
        baseUrl: "",
        applicationId: applicationId,
        permissions: permissions,
        maxMessagesCount: 5,
        settings: {
            debugMode: false,
            invitesInterval: 60,
            friendRequestsInterval: 60
        },
        implicitFlow: false,
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
            this.settings.invitesInterval = settings.invitesInterval;
            this.settings.friendRequestsInterval = settings.friendRequestsInterval;
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
        },

        setImplicitFlow: function() {
            this.implicitFlow = true;
        }
    };

    return context;
}