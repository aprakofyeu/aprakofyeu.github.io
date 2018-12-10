function MessageSender(context, callService, formatter, eventBroker) {
    var $dialog;

    function showProgressBar(users) {
        $dialog = $("#messagedSendingStatusDialog").dialog({
            modal: true,
            width: 500,
            title: "Статус:",
            open: function (event, ui) {
                $(".ui-dialog-titlebar-close", ui.dialog | ui).hide();
                $(this).find(".summary").empty().removeClass("sucess").removeClass("fail");
                var $progressbar = $(this).find("#progressbar").progressbar({
                    max: users.length,
                    value: 0,
                    change: function () {
                        $(this).find(".progress-label").text("Отправлено " + $progressbar.progressbar("value") + " из " + users.length);
                    },
                    complete: function () {
                        $(this).find(".progress-label").text("Все сообщения успешно отправлены!");
                    }
                });
            },
            buttons: {
                "Стоп!": function () {
                    alert("not implemented!");
                }
            }
        });
    }

    function refreshProgress() {
        var $progressbar = $dialog.find("#progressbar");
        var val = $progressbar.progressbar("value") || 0;
        $progressbar.progressbar("value", val + 1);
    }

    function finishProgress(message, summaryClass) {
        $dialog.find(".summary").addClass(summaryClass).text(message);
        $dialog.dialog('option', 'buttons', { "Закрыть": function () { $dialog.dialog("close"); } });
    }

    function sucessProgressBar(message) {
        finishProgress(message, "sucess");
    }

    function failProgressBar(message) {
        finishProgress(message, "fail");
    }





    function sendMessage(message, attachments, users) {
        attachments = formatter.formatAttachments(attachments);

        function send(users, deferred) {
            if (!deferred) {
                deferred = new $.Deferred();
            }

            var user = users[0];
            users = users.slice(1, users.length);
            var formattedMessage = formatter.format(message, user);

            callService.call("messages.send", { user_id: user.id, message: formattedMessage, attachment: attachments })
                .then(function () {
                    refreshProgress();
                    user.sent = true;
                    eventBroker.publish(VkAppEvents.sendMessageOk, user.id);
                    if (users.length > 0) {
                        setTimeout(function () {
                            send(users, deferred);
                        }, context.settings.messagesInterval * 1000);
                    } else {
                        deferred.resolve();
                    }
                },
                    function (error) {
                        eventBroker.publish(VkAppEvents.sendMessageFailed, user.id, error);
                        deferred.reject(error);
                    });

            return deferred.promise();
        }

        if (users && users.length > 0) {
            showProgressBar(users);

            send(users).then(function () {
                sucessProgressBar("Все сообщения успешно отправлены!");
            }, function (error) {
                failProgressBar("Во время отправки сообщений что-то пошло не так :(<br/>Ошибка: " + error);
            });
        }
    };

    return {
        sendToAll: function (message, attachments) {
            var users = context.searchResult.users.filter(function (user) { return !user.sent; });
            sendMessage(message, attachments, users);
        },

        sendToMe(message, attachments) {
            sendMessage(message, attachments, [context.user, context.user, context.user, context.user, context.user, context.user, context.user, context.user, context.user, context.user, context.user, context.user, context.user, context.user, context.user, context.user]);
        }
    };
}