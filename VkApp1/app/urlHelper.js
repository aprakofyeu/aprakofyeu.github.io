function UrlHelper() {
    return {
        parseUrlParameters: function (url) {
            var paramsRaw = url.split('#')[1].split('&');
            var resultParameters = {};
            for (var i = 0; i < paramsRaw.length; i++) {
                var paramName = paramsRaw[i].split('=');
                resultParameters[paramName[0]] = paramName[1] === undefined ? true : decodeURIComponent(paramName[1]);
            }
            return resultParameters;
        },

        parsePostUrl: function () {
            return {
                ownerId: '-169855297',
                itemId: '101'
            };
        }
    };
}
