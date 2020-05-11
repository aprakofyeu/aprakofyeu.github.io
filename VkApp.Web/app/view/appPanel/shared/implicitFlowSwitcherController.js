function ImplicitFlowSwitcherController(initializationService, context, eventBroker) {
    function refreshUi($switcherPanel) {
        if (context.implicitFlow) {
            $switcherPanel.hide();
        } else {
            $switcherPanel.show();
        }
    }

    function initSwitcherPanels() {
        $(".implicitFlowSwitcherPanel")
            .each(function() {
                var $switcherPanel = $(this);
                var activateTabEvent = $switcherPanel.closest("[on-activate-event]").attr("on-activate-event");

                $switcherPanel.on("click",
                    function () {
                        initializationService.goToImplicitFlowAuthenticationStep();
                    });

                refreshUi($switcherPanel);

                eventBroker.subscribe(activateTabEvent, function () { refreshUi($switcherPanel); });
            });
    }

    eventBroker.subscribe(VkAppEvents.initializationCompleted, function () { initSwitcherPanels(); });

}