function GroupUsersDataLoader(context, callService) {
    var BatchSize = 500;

    return {
        checkIsMembers: function (userIds, extended, reportStatus) {

            function checkIsMember(offset) {
                var userIdsBatch = userIds.slice(offset, offset + BatchSize);

                return callService.call('groups.isMember', {
                        group_id: context.targetGroup.id,
                        user_ids: userIdsBatch,
                        extended: extended ? 1 : 0
                    })
                    .then(function (results) {
                        var totalLoadedCount = offset + BatchSize;

                        if (reportStatus) {
                            reportStatus(totalLoadedCount, userIds.length);
                        }

                        if (totalLoadedCount < userIds.length) {
                            return checkIsMember(totalLoadedCount)
                                .then(function (moreResults) {
                                    return results.concat(moreResults);
                                });
                        }
                        return results;
                    });
            }

            return checkIsMember(0);
        }
    };
}