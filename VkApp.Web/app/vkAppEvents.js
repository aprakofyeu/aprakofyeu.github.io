VkAppEvents = {
    authenticationCompleted: "authenticationCompleted",
    authenticationError: "authenticationError",

    initializationStart: "initializationStart",
    initializationStatus: "initializationStatus",
    initializationMessagesStart: "initializationMessagesStart",
    initializationCompleted: "initializationCompleted",
    initializationError: "initializationError",

    search: "search",
    searchCompleted: "searchCompleted",
    searchFailed: "searchFailed",

    sendMessageOk: "sendMessageOk",
    sendMessageFailed: "sendMessageFailed",
    sendMessageWarning: "sendMessageWarning",

    changeStep:"changeStep"
};

VkAppSteps = {
    authentication: "authentication",
    initialization: "initialization",
    initializationProgress: "initializationProgress",
    app:"app"
}