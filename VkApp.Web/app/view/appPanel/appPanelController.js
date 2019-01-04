function AppPanelController(eventBroker) {
    $("#tabs").tabs({
        activate: function(event, ui) {
            var onActivateEvent = ui.newPanel.attr("on-activate-event");
            if (onActivateEvent) {
                eventBroker.publish(onActivateEvent);
            }
        }
    });
}