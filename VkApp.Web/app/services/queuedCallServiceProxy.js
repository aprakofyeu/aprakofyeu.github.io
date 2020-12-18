function QueuedCallServiceProxy(callService, context) {
    var callsQueue = new DeferredQueue();
    var readyToCall = true;

    function setReadyToCall() {
        setTimeout(function () {
            readyToCall = true;
        }, context.callServiceInterval);
    }

    function checkAndCall() {
        if (readyToCall) {
            var deferredCall = callsQueue.dequeue();
            if (deferredCall) {
                readyToCall = false;
                callService.call(deferredCall.method, deferredCall.parameters)
                    .then(function (result) {
                        setReadyToCall();
                        deferredCall.resolve(result);
                    }, function (error) {
                        setReadyToCall();
                        deferredCall.reject(error);
                    });
            }
        }
    }

    setInterval(checkAndCall, 10);

    return {
        init: function (accessToken) {
            callService.init(accessToken);
        },
        call: function (method, parameters) {
            return callsQueue.enqueue(method, parameters);
        }
    };
}