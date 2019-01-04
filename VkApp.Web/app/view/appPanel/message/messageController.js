function MessagesController(formatter, messageSender, apiService, urlHelper, eventBroker) {
    var $panel = $(".message-panel");
    var $textarea = $panel.find("#message");
    var $attachments = $panel.find("#attachments");

    function showWarning(message) {
        $panel
            .find(".summary.warning")
            .html(message)
            .show();
    }

    function loadUserSavedMessage() {
        apiService.getUserSavedMessage()
            .then(function (resp) {

                if (resp.userMessage) {
                    $textarea.text(formatter.unescape(resp.userMessage.message));
                    var attachments = JSON.parse(resp.userMessage.attachments);
                    renderAttachments(attachments);
                }
            }, function (error) {
                showWarning("Не удалось загрузить сохраненное сообщение:(<br>" + error);
            });
    }

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
            attachments.push($(this).data().attachment);
        });
        return attachments;
    }

    function sendMessage(send) {
        var message = getMessage();
        if (message) {
            var attachments = getAttachments();
            messageSender.saveUserMessage(message, attachments);

            attachments = attachments.map(function (a) { return a.id; });
            send(message, attachments);
        }
    };

    $panel.find("#sendMessageButton").on("click",
        function () {
            sendMessage(function (message, attachments) {
                messageSender.sendToAll(message, attachments);
            });
        });

    $panel.find("#sendMessageToMeButton").on("click",
        function () {
            sendMessage(function (message, attachments) {
                messageSender.sendToMe(message, attachments);
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
        var attachmentHtml = $("#attachmentTemplate")
            .tmpl(attachment)
            .data({ attachment: attachment });

        $attachments.append(attachmentHtml);
    }

    function renderAttachments(attachments) {
        $attachments.empty();
        if (attachments) {
            attachments.forEach(addAttachment);
        }
    }

    function initAttachmentByLink(options) {
        showUrlDialog(options.dialogTitle,
            function (url) {
                var attachmentInfo = options.parseUrlParameters(url);
                if (!attachmentInfo) {
                    return false;
                }

                var id = formatter.formatAttachmentId(options.attachmentType, attachmentInfo);
                var attachment = {
                    id: id,
                    title: options.attachmentTitle,
                    name: id,
                    url: url
                };

                addAttachment(attachment);
                return true;
            });
    }

    $panel.find(".attach-photo").on("click",
        function () {
            initAttachmentByLink({
                dialogTitle: "Добавить фото",
                parseUrlParameters: urlHelper.parsePhotoUrl,
                attachmentType: "photo",
                attachmentTitle: "Фото"
            });
        });

    $panel.find(".attach-video").on("click",
        function () {
            initAttachmentByLink({
                dialogTitle: "Добавить видео",
                parseUrlParameters: urlHelper.parseVideoUrl,
                attachmentType: "video",
                attachmentTitle: "Видео"
            });
        });

    $panel.find(".attach-audio-playlist").on("click",
        function () {
            initAttachmentByLink({
                dialogTitle: "Добавить плэйлист",
                parseUrlParameters: urlHelper.parseAudioPlaylistUrl,
                attachmentType: "audio_playlist",
                attachmentTitle: "Плэйлист"
            });
        });

    $attachments.on("click", ".remove-btn", function () {
        $(this).closest(".attachment").remove();
    });

    eventBroker.subscribe(VkAppEvents.searchCompleted, function () {
        $panel.show();
    });

    eventBroker.subscribe(VkAppEvents.search, function () {
        $panel.hide();
    });

    eventBroker.subscribe(VkAppEvents.initializationCompleted, function () { loadUserSavedMessage(); });
    eventBroker.subscribe(VkAppEvents.saveUserMessageError, function (error) { showWarning("Не удалось сохранить сообщение...<br/>" + error); });
}