function MessageProgressBar(context) {
    var $dialog;

    function getTitle() {
        var title = "Отправка сообщений:";
        if (context.settings.debugMode) {
            title += " (DEBUG MODE - эмуляция)";
        }
        return title;
    }

    return {
        init: function (users, cancelCallback) {
            $dialog = $("#messagesProgressDialogTemplate").tmpl().dialog({
                modal: true,
                width: 500,
                title: getTitle(),
                open: function (event, ui) {
                    $(".ui-dialog-titlebar-close", ui.dialog | ui).hide();
                    var $progressbar = $(this).find("#progressbar").progressbar({
                        max: users.length,
                        value: 0,
                        change: function () {
                            $(this).find(".progress-label").text("Отправлено " + $progressbar.progressbar("value") + " из " + users.length + " сообщений.");
                        },
                        complete: function () {
                            $(this).find(".progress-label").text("Все сообщения успешно отправлены!");
                        }
                    });
                },
                buttons: {
                    "Стоп!": function () {
                        cancelCallback();
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
            if (error) {
                $dialog.find(".summary").text(error).show();
            }
            $dialog.dialog('option', 'buttons', { "Закрыть": function () { $dialog.dialog("destroy"); } });
        }

    };
}