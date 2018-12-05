function MessagesController(formatter, messageSender, eventBroker) {
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

    $panel.find("#sendMessageButton").on("click",
        function () {
            var message = getMessage();
            if (message) {
                messageSender.sendToAll(message);
            }
        });

    $panel.find("#sendMessageToMeButton").on("click",
        function() {
            var message = getMessage();
            if (message) {
                messageSender.sendToMe(message);
            }
        });

    $panel.find(".first-name").on("click",
        function() {
            formatter.insertAtCaret($textarea[0], formatter.firstNameTag);
        });

    $panel.find(".last-name").on("click",
        function() {
            formatter.insertAtCaret($textarea[0], formatter.lastNameTag);
        });

    $panel.find(".attachment").on("click",
        function() {
//            alert("temporary disabled");

            var attachment = {
                id:"asd123_2",
                type: "photo",
                name: "опция в разработке"
            };



            $attachments.append($("#attachmentTemplate").tmpl(attachment));

        });

    eventBroker.subscribe(VkAppEvents.searchCompleted, function () {
        $panel.show();
    });

}