function MessagesController(formatter, messageSender, formatter, urlHelper, eventBroker) {
    var $panel = $(".message-panel");
    var $textarea = $panel.find("#message");
    var $attachments = $panel.find("#attachments");

    function getMessage() {
        var message = $textarea.val();
        if (!message) {
            alert("Введите сообщение!");
        }
        return message;
    }

    function getAttachments() {
        var attachments = [];
        $attachments.find(".attachment").each(function () {
            attachments.push($(this).attr("attachment-id"));
        })
        return attachments;
    }

    function sendMessage(send) {
        var message = getMessage();
        if (message) {
            var attachments = getAttachments();
            send(message, attachments);
        }
    };

    $panel.find("#sendMessageButton").on("click",
        function () {
            sendMessage(function (message, attachments) {
                messageSender.sendToAll(message, attachments)
            });
        });

    $panel.find("#sendMessageToMeButton").on("click",
        function () {
            sendMessage(function (message, attachments) {
                messageSender.sendToMe(message, attachments)
            });
        });

    $panel.find(".first-name").on("click",
        function () {
            formatter.insertAtCaret($textarea[0], formatter.firstNameTag);
        });

    $panel.find(".last-name").on("click",
        function () {
            formatter.insertAtCaret($textarea[0], formatter.lastNameTag);
        });

    function showUrlDialog(title, addAction) {
        var dialog = $("#addByUrlDialog").dialog({
            modal: true,
            width: 600,
            title: title,
            open: function () {
                $(this).find("#photoUrlInput")
                    .val("")
                    .removeClass("invalid")
                    .on("change", function () {
                        $(this).removeClass("invalid");
                    });
            },
            buttons: {
                "Добавить": function () {
                    var $input = $(this).find("#photoUrlInput");
                    var url = $input.val();
                    if (!addAction(url)) {
                        $input.addClass("invalid");
                        return;
                    }
                    dialog.dialog("close");
                },
                "Отмнена": function () {
                    dialog.dialog("close");
                }
            }
        });
    }

    function addAttachment(attachment) {
        $attachments.append($("#attachmentTemplate").tmpl(attachment));
    }

    $panel.find(".attach-photo").on("click",
        function () {
            showUrlDialog("Добавить фото", function (url) {
                var photoInfo = urlHelper.parsePhotoUrl(url);
                if (!photoInfo) {
                    return false;
                }

                var id = formatter.formatAttachmentId("photo", photoInfo);
                var attachment = {
                    id: id,
                    title: "Фото",
                    name: id,
                    url: url
                };

                addAttachment(attachment);
                return true;
            });
        });
    
    $panel.find(".attach-video").on("click",
        function () {
            showUrlDialog("Добавить видео", function (url) {
                var videoInfo = urlHelper.parseVideoUrl(url);
                if (!videoInfo) {
                    return false;
                }

                var id = formatter.formatAttachmentId("video", videoInfo);
                var attachment = {
                    id: id,
                    title: "Видео",
                    name: id,
                    url: url
                };

                addAttachment(attachment);
                return true;
            });
        });

    $attachments.on("click", ".remove-btn", function () {
        $(this).closest(".attachment").remove();
    });

    eventBroker.subscribe(VkAppEvents.searchCompleted, function () {
        $panel.show();
    });

}