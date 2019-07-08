function MessagesFormatter() {
}

String.prototype.replaceAll = function (search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};

MessagesFormatter.prototype.firstNameTag = "<FirstName>";
MessagesFormatter.prototype.lastNameTag = "<LastName>";

MessagesFormatter.prototype.escape = function (text) {
    return $("<div>").text(text).html();
};

MessagesFormatter.prototype.unescape = function (text) {
    return $("<div>").html(text).text();
};

MessagesFormatter.prototype.format = function (message, user) {
    function wrapBlank(text) {
        return " " + text + " ";
    }

    return message
        .replaceAll(this.firstNameTag, wrapBlank(user.first_name))
        .replaceAll(this.lastNameTag, wrapBlank(user.last_name));
};

MessagesFormatter.prototype.formatAttachmentId = function (type, item) {
    return type + item.ownerId + "_" + item.itemId;
};

MessagesFormatter.prototype.formatAttachments = function (attachments) {
    return attachments
        ? attachments.map(function (x) { return x.id; }).join(",")
        : null;
};

MessagesFormatter.prototype.formatMessageForUrl = function (message, attachments, targetUser, context) {
    function splitId(id) {
        return id
            .replace("photo", "photo;")
            .replace("video", "video;")
            .replace("audio_playlist", "audio_playlist;")
            .split(";");
    }

    var parameters = ["sel=" + targetUser.id, "sndall_vkuserid=" + context.user.id, "sndall_groupid=" + context.targetGroup.id];

    var formattedMessage = escape(this.format(message, targetUser));
    parameters.push("sndall_message=" + formattedMessage);

    if (attachments && attachments.length) {
        var formattedAttachments = [];
        for (var i = 0; i < attachments.length; i++) {
            var splittedId = splitId(attachments[i].id);
            formattedAttachments.push({ type: splittedId[0], id: splittedId[1] });
        }
        parameters.push("sndall_attachments=" + escape(JSON.stringify(formattedAttachments)));
    }

    var url = "https://vk.com/im?" + parameters.join("&");

    return url;
};


MessagesFormatter.prototype.insertAtCaret = function (txtarea, text) {
    $(txtarea).focus();

    var scrollPos = txtarea.scrollTop;
    var strPos = 0;
    var br = ((txtarea.selectionStart || txtarea.selectionStart === '0') ?
        "ff" : (document.selection ? "ie" : false));
    if (br === "ie") {
        txtarea.focus();
        var range = document.selection.createRange();
        range.moveStart('character', -txtarea.value.length);
        strPos = range.text.length;
    } else if (br === "ff") {
        strPos = txtarea.selectionStart;
    }

    var front = (txtarea.value).substring(0, strPos);
    var back = (txtarea.value).substring(strPos, txtarea.value.length);
    txtarea.value = front + text + back;
    strPos = strPos + text.length;
    if (br === "ie") {
        txtarea.focus();
        var ieRange = document.selection.createRange();
        ieRange.moveStart('character', -txtarea.value.length);
        ieRange.moveStart('character', strPos);
        ieRange.moveEnd('character', 0);
        ieRange.select();
    } else if (br === "ff") {
        txtarea.selectionStart = strPos;
        txtarea.selectionEnd = strPos;
        txtarea.focus();
    }

    txtarea.scrollTop = scrollPos;
};