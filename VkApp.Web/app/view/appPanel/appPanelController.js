function AppPanelController(eventBroker) {
    var $tabs = $("#tabs");
    $tabs.tabs({
        activate: function(event, ui) {
            var onActivateEvent = ui.newPanel.attr("on-activate-event");
            if (onActivateEvent) {
                eventBroker.publish(onActivateEvent);
            }
        }
    });

    eventBroker.subscribe(VkAppEvents.changeStep,
        function(step) {
            if (step === VkAppSteps.app) {
                var activeIndex = $tabs.tabs("option", "active");
                var activePanel = $tabs.data().uiTabs.panels[activeIndex];
                var onActivateEvent = $(activePanel).attr("on-activate-event");
                eventBroker.publish(onActivateEvent);
            }
        });
}