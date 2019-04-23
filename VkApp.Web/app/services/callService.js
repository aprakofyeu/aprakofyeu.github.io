function CallService(context, captchaService) {
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
            var params = $.extend(parameters, { v: "5.73" });
            var deferred = new $.Deferred();

            if (VK._session && this.accessToken) {
                VK._session.sid = this.accessToken;
            }

            if (context.settings.debugMode && (method === "messages.send" || method === "messages.delete")) {
                setTimeout(function () { deferred.resolve(); }, 1000);
            } else {
                call(method, params, deferred);
            }

            return deferred.promise();
        },

        callWithDelay: function (method, parameters, delay) {
            var that = this;
            var deferred = new $.Deferred();

            if (!delay && delay !== 0) {
                delay = 1000;
            }

            setTimeout(function () {
                that.call(method, parameters).then(function (result) {
                    deferred.resolve(result);
                }, function (error) {
                    deferred.reject(error);
                });
            }, delay);

            return deferred.promise();
        }
    };
}