function FriendRequestService(callService, apiService, eventBroker) {
    return {
        addFriends: function (userIds) {

            function addNext(index) {

                if (index >= userIds.length) {
                    eventBroker.publish(VkAppEvents.addFriendsCompleted);
                    return;
                }

                var userId = userIds[index];
                callService.call("friends.add", { user_id: userId })
                    .then(function(result) {
                        if (result > 0) {
                            eventBroker.publish(VkAppEvents.addFriendSuccess, userId);
                            return apiService.markAsFriendRequested(userId);
                        }
                    })
                    .then(function() {
                        Utils.actionWithDelay(function() {
                            addNext(index + 1);
                        }, 1000);
                    }).then(function() {
                        },
                        function(error) {
                            eventBroker.publish(VkAppEvents.addFriendError, userId, error);
                        });
            }

            eventBroker.publish(VkAppEvents.addFriendsStart, userIds);

            addNext(0);
        }
    };
}