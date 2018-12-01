function ResultsController(eventBroker) {

    function renderUsers(users) {
        $.get("templates/users.html",
            function (templateBody) {
                $(".results").empty();
                $.tmpl(templateBody, users).appendTo('.results');
            });
    }

    eventBroker.subscribe(VkAppEvents.searchCompleted, function (users) { renderUsers(users); });
}