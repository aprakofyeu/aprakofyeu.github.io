function MessagesController(formatter, messageSender, apiService, urlHelper, context, eventBroker) {
    var $panel = $(".message-panel");
    var $attachmentTemplate = $panel.find("#attachmentTemplate");
    var $inputMessageTemplate = $panel.find("#inputMessageTemplate");
    var $messagesContainer = $panel.find("#inputMessagesContainer");

    function showWarning(message) {
        $panel
            .find(".summary.warning")
            .html(message)
            .show();
    }

    function initMessagesActions() {
        function getMessagePanel(element) {
            return $(element).closest('.input-message-panel');
        }

        function getTextarea(element) {
            return getMessagePanel(element).find("textarea");
        }

        function getAttachmentsPanel(element) {
            return getMessagePanel(element).find(".attachments");
        }

        $messagesContainer.on("click", ".first-name",
            function () {
                formatter.insertAtCaret(getTextarea(this)[0], formatter.firstNameTag);
            });

        $messagesContainer.on("click", ".last-name",
            function () {
                formatter.insertAtCaret(getTextarea(this)[0], formatter.lastNameTag);
            });

        $messagesContainer.on("click", ".attach-photo",
            function () {
                initAttachmentByLink({
                    dialogTitle: "Добавить фото",
                    parseUrlParameters: urlHelper.parsePhotoUrl,
                    attachmentType: "photo",
                    attachmentTitle: "Фото"
                }, getAttachmentsPanel(this));
            });

        $messagesContainer.on("click", ".attach-video",
            function () {
                initAttachmentByLink({
                    dialogTitle: "Добавить видео",
                    parseUrlParameters: urlHelper.parseVideoUrl,
                    attachmentType: "video",
                    attachmentTitle: "Видео"
                }, getAttachmentsPanel(this));
            });

        $messagesContainer.on("click", ".attach-audio-playlist",
            function () {
                initAttachmentByLink({
                    dialogTitle: "Добавить плэйлист",
                    parseUrlParameters: urlHelper.parseAudioPlaylistUrl,
                    attachmentType: "audio_playlist",
                    attachmentTitle: "Плэйлист"
                }, getAttachmentsPanel(this));
            });

        $messagesContainer.on("click", ".attachment .remove-btn", function () {
            $(this).closest(".attachment").remove();
        });

        $messagesContainer.on("click", ".remove-message", function () {
            var $message = getMessagePanel(this);
            var $dialog = $("<div>Вы уверены, что хотите удалить сообщение?</div>").dialog({
                modal: true,
                width: 600,
                title: "Внимание!",
                buttons: {
                    "Удалить": function () {
                        $message.remove();
                        $dialog.dialog("destroy");
                    },
                    "Отмнена": function () {
                        $dialog.dialog("destroy");
                    }
                }
            });
        });
    }

    function renderMessage(message) {
        var $message = $inputMessageTemplate
            .tmpl(message);

        renderAttachments(message.attachments, $message.find(".attachments"));

        $messagesContainer.append($message);
    }

    function loadUserSavedMessage() {
        initMessagesActions();

        apiService.getUserSavedMessages()
            .then(function (resp) {

                var messages = resp.userMessages.map(function (x) {
                    return {
                        message: formatter.unescape(x.message),
                        attachments: JSON.parse(x.attachments)
                    };
                });

                if (!messages.length) {
                    messages.push({ message: "", attachments: [] });
                }

                $messagesContainer.empty();
                for (var i = 0; i < messages.length; i++) {
                    renderMessage(messages[i]);
                }

            }, function (error) {
                showWarning("Не удалось загрузить сохраненное сообщение:(<br>" + error);
            });
    }

    function addAttachment(attachment, $container) {
        var attachmentHtml = $attachmentTemplate
            .tmpl(attachment)
            .data({ attachment: attachment });

        $container.append(attachmentHtml);
    }

    function renderAttachments(attachments, $container) {
        $container.empty();
        if (attachments) {
            attachments.forEach(function (attachment) {
                addAttachment(attachment, $container);
            });
        }
    }

    function getMessages() {
        var messages = [];

        $messagesContainer
            .find(".input-message-panel")
            .each(function () {
                messages.push({
                    message: $(this).find("textarea").val(),
                    attachments: getAttachments($(this).find(".attachments"))
                });
            });

        return messages;
    }

    function isValid(messages) {
        for (var i = 0; i < messages.length; i++) {
            if (!messages[i].message) {
                return false;
            }
        }
        return messages.length > 0;
    }

    function getAttachments($container) {
        var attachments = [];
        $container.find(".attachment").each(function () {
            attachments.push($(this).data().attachment);
        });
        return attachments;
    }

    function sendMessage(send) {
        var messages = getMessages();
        if (isValid(messages)) {
            messageSender.saveUserMessages(messages);
            send(messages);
        } else {
            alert("Все сообщения должны быть НЕ пустыми!");
        }
    };

    $panel.find("#sendMessageButton").on("click",
        function () {
            sendMessage(function (messages) {
                messageSender.sendToAll(messages);
            });
        });

    $panel.find("#sendMessageToMeButton").on("click",
        function () {
            sendMessage(function (messages) {
                messageSender.sendToMe(messages);
            });
        });

    $panel.find("#saveMessageButton").on("click",
        function () {
            sendMessage(function() {
                //empty function. just for save messages.
                alert("Сообщения успешно сохранены");
            });
        });

    $panel.find(".add-message-button").on("click",
        function () {
            if ($messagesContainer.find(".input-message-panel").length >= context.maxMessagesCount) {
                alert("Достигнуто максомально доступное количество сообщений!");
                return;
            }
            renderMessage({ message: "", attachments: [] });
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

    function initAttachmentByLink(options, $container) {
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

                addAttachment(attachment, $container);
                return true;
            });
    }

    eventBroker.subscribe(VkAppEvents.searchCompleted, function () {
        $panel.show();
    });

    eventBroker.subscribe(VkAppEvents.search, function () {
        $panel.hide();
    });

    eventBroker.subscribe(VkAppEvents.initializationCompleted, function () { loadUserSavedMessage(); });
    eventBroker.subscribe(VkAppEvents.saveUserMessageError, function (error) { showWarning("Не удалось сохранить сообщения...<br/>" + error); });


    return {
        getMessages: function() {
            var messages = getMessages();
            return isValid(messages) ? messages : null;
        }
    };
}