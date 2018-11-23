function AppView(eventBroker) {
    $("#getLikesButton").on("click", function () { eventBroker.publish("getLikesForPost"); });

    return {
        switchToInitializationMode: function () {
            $(".initialization").show();
            $(".app").hide();
        },

        switchToAppMode: function () {
            $(".initialization").hide();
            $(".app").show();
        }
    };
}