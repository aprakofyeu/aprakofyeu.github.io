$(function () {
    setTimeout(function () {
        var searchParameters = new URL(window.location.href).searchParams;
        var targetUserId = searchParameters.get("sel");

        var message = searchParameters.get("sndall_message");
        if (message) {
            var vkId = searchParameters.get("sndall_vkuserid");
            var targetGroupId = searchParameters.get("sndall_groupid");

            if (!vkId || !targetUserId) {
                return;
            }

            var messageInfo = { txt: unescape(message) };

            var attachments = unescape(searchParameters.get("sndall_attachments"));
            if (attachments) {
                messageInfo.attaches = JSON.parse(attachments);
            }

            var imStore = {};
            imStore["draft_" + targetUserId] = messageInfo;

            window.localStorage["im_store_" + vkId] = JSON.stringify(imStore);

            window.localStorage["sndall_checksend"] = JSON.stringify({ targetUserId: targetUserId, targetGroupId: targetGroupId});

            window.location.href = window.location.origin + window.location.pathname + "?sel=" + targetUserId;
            return;
        }

        var checkContext = window.localStorage["sndall_checksend"];
        if (checkContext) {
            window.localStorage.removeItem("sndall_checksend");
            checkContext = JSON.parse(checkContext);
            if (checkContext.targetUserId === targetUserId) {
                var check = function() {
                    if (hasError()) {
                        window.location.href = "http://sndall.ru/api/messages/undoMessage?targetUserId=" +
                            targetUserId + "&targetGroupId=" + checkContext.targetGroupId;
                    } else {
                        setTimeout(check, 1000);
                    }
                };
                check();
            }
        }

        function hasError() {
            var $errorMessageLabel = $(".im-page--error").not(':hidden');
            return $errorMessageLabel.length && $errorMessageLabel.text();
        }

    }, 0);
});
