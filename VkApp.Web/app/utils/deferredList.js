function DeferredList() {
    var deferredList = [];
    var resolveValue;
    var rejectError;

    return {
        promise: function () {
            if (resolveValue) {
                return new $.Deferred().resolve(resolveValue);
            }

            if (rejectError) {
                return new $.Deferred().reject(rejectError);
            }

            var deferred = new $.Deferred();
            deferredList.push(deferred);
            return deferred.promise();
        },
        resolve: function (result) {
            for (var i = 0; i < deferredList.length; i++) {
                deferredList[i].resolve(result);
            }
            deferredList = [];
            resolveValue = result;
        },
        reject: function(error) {
            for (var i = 0; i < deferredList.length; i++) {
                deferredList[i].reject(error);
            }
            deferredList = [];
            rejectError = error;
        }
    };
}