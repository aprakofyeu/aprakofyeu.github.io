Utils = {
    asPromise: function(obj) {
        var deferred = new $.Deferred();
        return deferred.resolve(obj);
    },
    actionWithDelay:function(action, delay) {
        var deferred = new $.Deferred();

        if (!delay) {
            delay = 0;
        }

        setTimeout(function () {
            var actionResult = action();
            if (actionResult && actionResult.then) {
                actionResult.then(function(result) {
                        deferred.resolve(result);
                    },
                    function(error) {
                        deferred.reject(error);
                    });
            } else {
                deferred.resolve(actionResult);
            }
        }, delay);

        return deferred.promise();
    }
};