function AppView(eventBroker) {

    function initEvents() {
        $("#getLikesButton").on("click", function () { eventBroker.publish("getLikesForPost"); });
        $("#sendMessageButton").on("click", function () { eventBroker.publish("sendMessageToAllUsers"); });
    }

    initEvents();

    return {
        switchToInitializationMode: function () {
            $(".initialization").show();
            $(".app").hide();
        },

        switchToAppMode: function () {
            $(".initialization").hide();
            $(".app").show();
        },

        renderUsersList: function (users) {
            var usersHtml = "";
            for (var i = 0; i < users.length; i++) {
                var user = users[i];
                usersHtml += "<div class='user-info' userId='" + user.id + "'><img src='" + user.photo_50 + "'/><label>" + user.first_name + " " + user.last_name + "</label></div>";
            }

            $(".likes-result").html(usersHtml);
        },

        showMessagePanel: function () {
            $(".message-panel").show();
        },

        getMessage: function () {
            return $("#message").val();
        },

        getSelectedUserIds: function () {
            return $(".user-info").map(function () { return $(this).attr("userId"); });
        }
    };
}