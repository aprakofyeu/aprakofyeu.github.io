function MessageProgressBar(context) {
    var $dialog;

    function getTitle() {
        var title = "Отправка сообщений:";
        if (context.settings.debugMode) {
            title += " (DEBUG MODE - эмуляция)";
        }
        return title;
    }

    function finish(error) {
        if (error) {
            $dialog.find(".summary.fail")
                .html("Опачки... Во время отправки сообщений что-то пошло не так :(" +
                    "<br/>Ошибка: " + error)
                .show();
        }
        $dialog.dialog('option', 'buttons', { "Закрыть": function () { $dialog.dialog("destroy"); } });
    }

    return {
        init: function (messagesCount, cancelCallback) {
            $dialog = $("#messagesProgressDialogTemplate").tmpl().dialog({
                modal: true,
                width: 600,
                title: getTitle(),
                open: function (event, ui) {
                    $(".ui-dialog-titlebar-close", ui.dialog | ui).hide();
                    var $progressbar = $(this).find("#progressbar").progressbar({
                        max: messagesCount,
                        value: 0,
                        change: function () {
                            $(this).find(".progress-label").text("Отправлено " + $progressbar.progressbar("value") + " из " + messagesCount + " сообщений.");
                        },
                        complete: function () {
                            $(this).find(".progress-label").text("Все сообщения успешно отправлены!");
                        }
                    });
                },
                buttons: {
                    "Стоп!": function () {
                        if (cancelCallback) {
                            cancelCallback();
                        }
                        finish("Отправка сообщений прервана.");
                    }
                }
            });
        },

        increase: function () {
            var $progressbar = $dialog.find("#progressbar");
            var val = $progressbar.progressbar("value") || 0;
            $progressbar.progressbar("value", val + 1);
        },

        finish: function (error) {
            finish(error);
        },

        warning: function (warning) {
            $dialog.find(".summary.warning")
                .html("Внимание!<br/>" + warning)
                .show();
        }

    };
}