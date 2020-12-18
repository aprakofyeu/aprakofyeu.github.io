function DeferredQueue() {
    var deferredQueue = [];

    return {
        enqueue: function(method, parameters) {
            var deferred = new $.Deferred();
            deferredQueue.push({
                deferred: deferred,
                method: method,
                parameters: parameters,
                resolve: function(result) {
                    this.deferred.resolve(result);
                },
                reject: function(error) {
                    this.deferred.reject(error);
                }
            });
            return deferred.promise();
        },
        dequeue: function() {
            if (deferredQueue.length === 0)
                return null;
            var deferredCall = deferredQueue[0];
            deferredQueue = deferredQueue.slice(1);
            return deferredCall;
        }
    };
}