function CallService() {
    return {
        init: function (accessToken) {
            this.accessToken = accessToken;
        },

        call: function (method, parameters) {
            var params = $.extend(parameters, { v: "5.73" });
            var deferred = new $.Deferred();

            if (VK._session) {
                VK._session.sid = this.accessToken;
            }

            VK.Api.call(method, params, function (r) {
                if (r.response) {
                    deferred.resolve(r.response);
                }
            });

            return deferred.promise();
        }
    };
}