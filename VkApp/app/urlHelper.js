function UrlHelper() {
    function parseParameters(url, delimiter) {
        var paramsRaw = url.split(delimiter)[1].split('&');
        var resultParameters = {};
        for (var i = 0; i < paramsRaw.length; i++) {
            var paramName = paramsRaw[i].split('=');
            resultParameters[paramName[0]] = paramName[1] === undefined ? true : decodeURIComponent(paramName[1]);
        }
        return resultParameters;
    }

    return {
        parseUrlParameters: function (url) {
            return parseParameters(url, "#");
        },

        parsePostUrl: function (postUrl) {
            var parameters = parseParameters(postUrl, "?");
            var postParametersRaw = parameters['w'];

            var splittedParams = postParametersRaw.replace("wall", "").split("_");

            return {
                ownerId: splittedParams[0],
                itemId: splittedParams[1].split("/")[0]
            };
        },

        getPublicId: function (publicUrl) {
            var splitted = publicUrl.split("/");
            var publicId = splitted[splitted.length - 1];

            if (publicId.indexOf("club") === 0) {
                publicId = publicId.replace("club", "");
            }

            return publicId;
        }
    };
}
