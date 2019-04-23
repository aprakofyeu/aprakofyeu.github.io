function InitializationService(apiService, callService, context, dateFormatter, eventBroker) {
    var conversationsBatchSize = 200;
    var initializationStartTime = dateFormatter.toNumber(context.settings.initializationStartPeriod);

    function defaultIfUndefined(value) {
        if (!value) {
            return 0;
        }
        return value;
    }

    function reportInitializationStatus(currentCount, totalCount) {
        eventBroker.publish(VkAppEvents.initializationStatus, { currentCount: currentCount, totalCount: totalCount });
    }

    function loadConversationsMock() {
        var deferred = new $.Deferred();

        setTimeout(function () {
            deferred.resolve([]);
        }, 0);

        return deferred.promise();
    }

    function loadAllConversationsWithUsers() {
        return loadConversationsMock();

        //function loadConversations(offset, delay) {
        //    offset = defaultIfUndefined(offset);
        //    delay = defaultIfUndefined(delay);

        //    return callService.callWithDelay('messages.getConversations', { offset: offset, count: conversationsBatchSize, extended: 0 }, delay)
        //        .then(function (result) {
        //            var totalLoadedCount = result.items.length + offset;
        //            reportInitializationStatus(totalLoadedCount, result.count);
        //            if (totalLoadedCount < result.count) {
        //                return loadConversations(totalLoadedCount, 250)
        //                    .then(function (moreItems) {
        //                        return result.items.concat(moreItems);
        //                    });
        //            }
        //            return result.items;
        //        });
        //}

        //return loadConversations().then(function (conversations) {
        //    return conversations.filter(function (x) {
        //        return x.conversation.peer.type === "user";
        //    });
        //});
    }

    function loadConversationInfo(userIds) {
        var conversationsInfo = [];

        function loadConversationInfoInner(index, delay) {
            if (index >= userIds.length) {
                var deferred = new $.Deferred();
                return deferred.resolve();
            }

            index = defaultIfUndefined(index);
            delay = defaultIfUndefined(delay);

            reportInitializationStatus(index, userIds.length);

            var userId = userIds[index];
            return callService.callWithDelay('messages.getHistory', { user_id: userId, offset: -1 }, delay)
                .then(function (response) {
                    return callService.call('messages.getHistory', { user_id: userId, offset: response.count - 1, count: 1 });
                })
                .then(function (response) {
                    conversationsInfo.push({ targetUserId: userId, date: response.items[0].date });
                })
                .then(function () {
                    return loadConversationInfoInner(index + 1, 750);
                });
        }

        return loadConversationInfoInner()
            .then(function () {
                return conversationsInfo;
            });
    }

    function initLegacyUserConversations(userIds) {
        eventBroker.publish(VkAppEvents.initializationMessagesStart);
        return loadConversationInfo(userIds)
            .then(function (conversationsInfo) {
                return conversationsInfo.filter(function (x) {
                    return x.date > initializationStartTime;
                });
            }).then(function (conversations) {
                var data = {
                    senderId: context.user.id,
                    targetGroupId: context.targetGroup.id,
                    conversations: conversations
                };
                return apiService.initUserConversations(data);
            });
    }

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
            eventBroker.publish(VkAppEvents.changeStep, VkAppSteps.initializationProgress);
            eventBroker.publish(VkAppEvents.initializationStart);
            loadAllConversationsWithUsers()
                .then(function (conversations) {
                    var usersToInitConversations = [];

                    for (var i = 0; i < conversations.length; i++) {
                        var userId = conversations[i].conversation.peer.id;
                        context.addConversationUserId(userId);

                        if (!context.user.messagesInitialized && conversations[i].last_message.date > initializationStartTime) {
                            usersToInitConversations.push(userId);
                        }
                    }

                    if (!context.user.messagesInitialized) {
                        return initLegacyUserConversations(usersToInitConversations);
                    }
                })
                .then(function () {
                    eventBroker.publish(VkAppEvents.initializationCompleted);
                    eventBroker.publish(VkAppEvents.changeStep, VkAppSteps.app);
                }, function (error) {
                    eventBroker.publish(VkAppEvents.initializationError, error);
                });
        }
    };
}