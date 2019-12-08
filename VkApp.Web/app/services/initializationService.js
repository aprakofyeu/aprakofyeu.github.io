function InitializationService(apiService, callService, context, eventBroker) {

    return {
        initApplicationByVkLogin: function () {
            var that = this;
            VK.init({
                apiId: context.applicationId
            });
            VK.Auth.login(function () {
                that.initUser();
            });
        },

        initApplication: function (accessToken) {
            VK.init({
                apiId: context.applicationId
            });
            VK.Auth.login(function() {

            });
            callService.init(accessToken);
        },

        initUser: function () {

            VK.Auth.getLoginStatus(function (resp) {
                if (!resp.session) {
                    eventBroker.publish(VkAppEvents.authenticationError, "Вы не авторизованы. Обновите страницу и попробуйте еще раз.");
                    return;
                }

                callService.call('users.get', { user_ids: resp.session.mid })
                    .then(function (response) {
                        var vkUser = response[0];
                        var user = {
                            id: vkUser.id,
                            firstName: vkUser.first_name,
                            lastName: vkUser.last_name
                        };
                        return apiService.initUser(user)
                            .then(function (userSettings) {
                                return {
                                    vkUser: response[0],
                                    userSettings: userSettings
                                };
                            }, function (error) {
                                eventBroker.publish(VkAppEvents.authenticationError, error);
                            });
                    })
                    .then(function (userInfo) {
                        context.setUser(userInfo.vkUser, userInfo.userSettings);
                        context.setSettings(userInfo.userSettings);
                        eventBroker.publish(VkAppEvents.authenticationCompleted);
                        eventBroker.publish(VkAppEvents.changeStep, VkAppSteps.initialization);
                    }, function (error) {
                        eventBroker.publish(VkAppEvents.authenticationError, error);
                    });
            });
        },

        initTargetGroup: function (group) {
            context.setTargetGroup(group);
        },

        startApplication: function () {
            eventBroker.publish(VkAppEvents.initializationCompleted);
            eventBroker.publish(VkAppEvents.changeStep, VkAppSteps.app);
        }
    };
}