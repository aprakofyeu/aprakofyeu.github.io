function CallService(context, captchaService) {
    var handleDebugMethods = {
        "messages.send": true,
        "messages.delete": true,
        "friends.delete": { success: 1 },
        "groups.invite": true
    };

    function handleError(error, method, params, deferred) {
        if (error.error_code === 14) {
            captchaService.handle(error, function (captcha) {
                params["captcha_sid"] = captcha.sid;
                params["captcha_key"] = captcha.key;

                call(method, params, deferred);
            }, function () {
                deferred.reject(error.error_msg);
            });

            return;
        }

        deferred.reject(error.error_msg);
    }

    function call(method, params, deferred) {
        VK.Api.call(method, params, function (r) {
            if (r.response) {
                deferred.resolve(r.response);
                return;
            }

            if (r.error) {
                handleError(r.error, method, params, deferred);
            }
        });
    }

    return {
        init: function (accessToken) {
            this.accessToken = accessToken;
        },

        call: function (method, parameters) {
            var params = $.extend(parameters, { v: "5.89" });
            var deferred = new $.Deferred();

            if (VK._session && this.accessToken) {
                VK._session.sid = this.accessToken;
            }

            if (context.settings.debugMode && handleDebugMethods[method]) {
                setTimeout(function () { deferred.resolve(handleDebugMethods[method]); }, 1000);
            } else {
                call(method, params, deferred);
            }

            return deferred.promise();
        }
    };
}