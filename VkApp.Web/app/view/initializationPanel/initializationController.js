function InitializationController(initializationService, targetGroupsProvider, inputsHelper, context, eventBroker) {
    var $panel = $(".initialization");
    var inputs = inputsHelper.for($panel);

    function showError(error) {
        $panel.find(".summary.error")
            .html("Во время инициализации что-то пошло не так=((<br/>Ошибка: " + error)
            .show();
    }

    function renderGroups(groups) {
        inputsHelper.renderOptions(
            $panel.find("#selectGroup"),
            groups,
            function (x) { return x.id; },
            function (x) { return x.name; },
            function (x) { return x.id === context.user.preferredGroup; });
    }

    function refreshTargetGroups() {
        if (!context.user.messagesInitialized) {
            $panel.find(".summary.warning").show();
        }

        targetGroupsProvider.getTargetGroups()
            .then(function (groups) {
                renderGroups(groups);
            }, function () {
                showError("Не удалось загрузить список групп");
            });
    }

    $("#addGroupButton").on("click",
        function () {
            var dialog = $("#addGroupDialog").dialog({
                modal: true,
                width: 600,
                title: "Добавить группу",
                open: function () {
                    $(this).find(".summary").empty().hide();
                    $(this).find("#groupUrlInput").val("");
                },
                buttons: {
                    "Добавить": function () {
                        var $input = $(this).find("#groupUrlInput");
                        targetGroupsProvider.addTargetGroup($input.val())
                            .then(function () {
                                refreshTargetGroups();
                                dialog.dialog("close");
                            }, function (error) {
                                dialog.find(".summary")
                                    .html("Опаньки... Что-то пошло не так... <br/>Ошибка: " + error)
                                    .show();
                            });
                    },
                    "Отмнена": function () {
                        dialog.dialog("close");
                    }
                }
            });
        });

    $("#initUserButton").on("click",
        function () {
            var groupId = inputs.getIntValue("#selectGroup");

            if (!groupId) {
                inputs.markAsInvalid("#selectGroup");
                return;
            }

            var group = targetGroupsProvider.getById(groupId);
            initializationService.initTargetGroup(group);
            initializationService.startApplication();
        });

    eventBroker.subscribe(VkAppEvents.initializationError, function (error) { showError(error); });
    eventBroker.subscribe(VkAppEvents.authenticationCompleted, function () { refreshTargetGroups(); });
}