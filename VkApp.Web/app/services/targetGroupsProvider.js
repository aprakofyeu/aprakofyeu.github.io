function TargetGroupsProvider(callService, apiService, urlHelper, context) {
    var cachedGroups;

    function addGroup(groupId) {
        var deferred = new $.Deferred();
        var group;
        callService.call("groups.getById", { group_id: groupId })
            .then(function (response) {
                group = { id: response[0].id, name: response[0].name };
                if (cachedGroups && cachedGroups.find(function (x) { return x.id === group.id; })) {
                    return deferred.reject("Эта группа уже добавлена");
                }

                return apiService.addTargetGroup(group);
            }).then(function (response) {

                if (response.success) {
                    if (cachedGroups) {
                        cachedGroups.push(group);
                    }

                    context.user.preferredGroup = group.id;
                    return deferred.resolve(group);
                }

                return deferred.reject("Server error");

            }, function (error) {
                return deferred.reject(error);
            });

        return deferred.promise();
    }

    return {
        getTargetGroups: function () {
            if (cachedGroups) {
                var deferred = new $.Deferred();
                return deferred.resolve(cachedGroups);
            }

            return apiService.loadTargetGroups()
                .then(function (groups) {
                    cachedGroups = groups;
                    return groups;
                });
        },
        getById: function(groupId) {
            return cachedGroups && cachedGroups.find(function(x) { return x.id === groupId; });
        },
        addTargetGroup: function (groupUrl) {
            var groupId = urlHelper.getGroupId(groupUrl);
            if (!groupId) {
                var deferred = new $.Deferred();
                return deferred.reject("Некорректный URL группы");
            }
            return addGroup(groupId);
        }
    };
}