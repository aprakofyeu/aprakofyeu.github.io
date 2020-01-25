﻿function GroupUsersDataLoader(context, callService) {
    var BatchSize = 500;

    return {
        checkIsMembers: function (userIds, extended, reportStatus) {

            function checkIsMember(offset, delay) {
                var userIdsBatch = userIds.slice(offset, offset + BatchSize);

                return callService.callWithDelay('groups.isMember', {
                        group_id: context.targetGroup.id,
                        user_ids: userIdsBatch,
                        extended: extended ? 1 : 0
                    }, delay)
                    .then(function (results) {
                        var totalLoadedCount = offset + BatchSize;

                        if (reportStatus) {
                            reportStatus(totalLoadedCount, userIds.length);
                        }

                        if (totalLoadedCount < userIds.length) {
                            return checkIsMember(totalLoadedCount, 250)
                                .then(function (moreResults) {
                                    return results.concat(moreResults);
                                });
                        }
                        return results;
                    });
            }

            return checkIsMember(0, 0);
        }
    };
}