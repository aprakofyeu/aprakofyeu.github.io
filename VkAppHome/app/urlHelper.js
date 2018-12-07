function UrlHelper() {
    function parseUrlParameters(url, delimiter) {
        var paramsRaw = url.split(delimiter)[1].split('&');
        var resultParameters = {};
        for (var i = 0; i < paramsRaw.length; i++) {
            var paramName = paramsRaw[i].split('=');
            resultParameters[paramName[0]] = paramName[1] === undefined ? true : decodeURIComponent(paramName[1]);
        }
        return resultParameters;
    }

    function parseVkItemParameters(type, itemParameters) {
        if (itemParameters.indexOf(type) < 0)
            return null;

        var splittedParams = itemParameters.replace(type, "").split("_");

        return {
            ownerId: splittedParams[0],
            itemId: splittedParams[1].split("/")[0]
        };
    }

    function runSafe(action) {
        try {
            return action();
        } catch (error) {
            return null;
        }
    }

    function parseVkItemUrlSafe(key, type, url) {
        //try to parse from url parameters
        var item = runSafe(function () {
            var parameters = parseUrlParameters(url, "?");
            var itemParametersRaw = parameters[key];
            return parseVkItemParameters(type, itemParametersRaw);
        });

        //try to parse as direct link
        if (!item) {
            item = runSafe(function () {
                var itemParametersRaw = url.split("/").pop();
                return parseVkItemParameters(type, itemParametersRaw);
            });
        }

        return item;
    }

    return {
        parseUrlParameters: function (url) {
            return runSafe(function () {
                return parseUrlParameters(url, "#");
            });
        },

        parseWallUrl: function (url) {
            return parseVkItemUrlSafe("w", "wall", url);
        },

        parsePhotoUrl: function (url) {
            return parseVkItemUrlSafe("z", "photo", url);
        },

        parseVideoUrl: function (url) {
            return parseVkItemUrlSafe("z", "video", url);
        },

        getPublicId: function (publicUrl) {
            return runSafe(function () {
                var splitted = publicUrl.split("/");
                var publicId = splitted[splitted.length - 1];

                if (publicId.indexOf("club") === 0) {
                    publicId = publicId.replace("club", "");
                }

                return publicId;
            });
        }
    };
}
