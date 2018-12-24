function StorageService(context) {
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
            return post("Storage/InitUser", user);
        },
        initUserConversations: function (data) {
            return post("Storage/InitUserConversations", data);
        },
        loadTargetGroups: function () {
            return get("Storage/LoadTargetGroups");
        },
        addTargetGroup: function (group) {
            return post("Storage/AddTargetGroup", group);
        },
        getUsersWithoutMessagesByGroup: function (targetGroupId, userIds) {
            return post("Storage/GetUsersWithoutMessagesByGroup", { targetGroupId: targetGroupId, userIds: userIds });
        },
        haveMessagesByGroup: function (targetGroupId, targetUserId) {
            return get("Storage/HaveMessagesByGroup", { targetGroupId: targetGroupId, targetUserId: targetUserId });
        },
        saveMessage: function (messageInfo) {
            if (context.settings.debugMode) {

                var deferred = new $.Deferred();
                setTimeout(function () { deferred.resolve({ success: true }); }, 1000);
                return deferred.promise();

            } else {
                return post("Storage/AddMessage", messageInfo);
            }
        }
    };
}