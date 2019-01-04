function MessagesFormatter() {
}

String.prototype.replaceAll = function (search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};

MessagesFormatter.prototype.firstNameTag = "<FirstName>";
MessagesFormatter.prototype.lastNameTag = "<LastName>";

MessagesFormatter.prototype.escape = function(text) {
    return $("<div>").text(text).html();
};

MessagesFormatter.prototype.unescape = function(text) {
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
    return attachments ? attachments.join(",") : null;
};

MessagesFormatter.prototype.insertAtCaret = function (txtarea, text) {
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