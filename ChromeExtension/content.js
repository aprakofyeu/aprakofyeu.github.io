$(function () {
    setTimeout(function () {
        var searchParameters = new URL(window.location.href).searchParams;

        var message = unescape(searchParameters.get("sndall_message"));
        if (message) {
            var vkId = searchParameters.get("sndall_vkid");
            var targetUserId = searchParameters.get("sel");

            if (!vkId || !targetUserId) {
                return;
            }

            var messageInfo = { txt: message };

            var attachments = unescape(searchParameters.get("sndall_attachments"));
            if (attachments) {
                messageInfo.attaches = JSON.parse(attachments);
            }

            var imStore = {};
            imStore["draft_" + targetUserId] = messageInfo;

            window.localStorage["im_store_" + vkId] = JSON.stringify(imStore);

            window.location.href = window.location.origin + window.location.pathname + "?sel=" + targetUserId;// + "&autosend_message=true";
            return;
        }

        //var autoSendMessage = searchParameters.get("autosend_message");
        //if (autoSendMessage) {
        //    setTimeout(function () {
        //        $("button.im-send-btn.im-send-btn_send").click();
        //    }, 0);
        //}

    }, 0);
});
