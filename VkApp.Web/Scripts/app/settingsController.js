function SettingsController(context) {
    function updateSettings($dialog) {
        var messagesInterval = parseInt($dialog.find("#timeInterval").val());
        if (messagesInterval) {
            context.settings.messagesInterval = messagesInterval;
        }

        context.settings.debugMode = !!$dialog.find("#debugMode")[0].checked;
    }

    $(".settings-btn").on("click", function () {
        var $dialog = $("#settingsDialogTemplate").tmpl(context.settings).dialog({
            modal: true,
            width: 600,
            title: "Настройки:",
            open: function (event, ui) {
                $(".ui-dialog-titlebar-close", ui.dialog | ui).hide();
            },
            buttons: {
                "Применить": function () {
                    updateSettings($dialog);
                    $dialog.dialog("destroy");
                },
                "Отмнена": function () {
                    $dialog.dialog("destroy");
                }
            }
        });
    });
}