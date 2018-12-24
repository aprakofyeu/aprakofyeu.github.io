function StepsController(eventBroker) {
    var stepPanels = $("#vkApp [step]");
    stepPanels.hide();

    var activeStep;

    var stepPanelsDict = {};
    stepPanels.each(function() {
        var step = $(this).attr("step");
        stepPanelsDict[step] = $(this);
        if (!activeStep) {
            activeStep = step;
        }
    });

    eventBroker.subscribe(VkAppEvents.changeStep,
        function(newStep) {
            stepPanelsDict[activeStep].hide();
            stepPanelsDict[newStep].show();
            activeStep = newStep;
        });
}