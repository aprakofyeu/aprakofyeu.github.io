﻿function ApiService(context) {
    function wrapCall(call) {
        var deferred = new $.Deferred();
        call.then(function (response) {
            deferred.resolve(response);
        }, function (response) {
            var error = response.status + ": " + response.statusText;
            deferred.reject(error);
        });
        return deferred.promise();
    }

    function prepareUrl(url) {
        return context.baseUrl + "/" + url;
    }

    function post(url, data) {
        return wrapCall($.post(prepareUrl(url), data));
    }

    function get(url, data) {
        return wrapCall($.get(prepareUrl(url), data));
    }

    return {
        initUser: function (user) {
            return post("api/user/init", user);
        },
        loadTargetGroups: function () {
            return get("api/groups/all");
        },
        addTargetGroup: function (group) {
            return post("api/groups/add", group);
        },
        getStatisticsGroups: function() {
            return get("api/statistics/groups", { targetGroupId: context.targetGroup.id });
        },
        getAllMessages: function () {
            return get("api/messages/getAll", { targetGroupId: context.targetGroup.id });
        },
        getUsersWithoutMessagesByCurrentGroup: function (userIds) {
            return post("api/messages/usersWithoutMessages", { targetGroupId: context.targetGroup.id, senderUserId: context.user.id, userIds: userIds });
        },
        haveMessagesByCurrentGroup: function (targetUserId) {
            return get("api/messages/haveMessages", { targetGroupId: context.targetGroup.id, senderUserId: context.user.id, targetUserId: targetUserId });
        },
        saveMessage: function (messageInfo) {
            if (context.settings.debugMode) {

                var deferred = new $.Deferred();
                setTimeout(function () { deferred.resolve({ success: true }); }, 1000);
                return deferred.promise();

            } else {
                return post("api/messages/add", messageInfo);
            }
        },
        updateSettings: function (settings) {
            var userSettings = {
                userId: context.user.id,
                sendInterval: settings.sendInterval,
                saveLastMessage: settings.saveLastMessage
            };

            return post("api/user/update", { userSettings: userSettings });
        },
        getUserSavedMessages: function () {
            return get("api/user/savedMessages/get", { userId: context.user.id, groupId: context.targetGroup.id });
        },
        saveUserMessages: function (messages) {
            return post("api/user/savedMessages/save",
                {
                    userId: context.user.id,
                    groupId: context.targetGroup.id,
                    messages: messages
                });
        },
        clearUserSavedMessages: function () {
            return post("api/user/savedMessages/clear", { userId: context.user.id });
        }
    };
}