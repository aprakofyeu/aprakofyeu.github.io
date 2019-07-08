(function() {
    var currentVersion = 3;

    var sndallInfo = window.localStorage["sndallExtension"];
    if (sndallInfo) {
        sndallInfo = JSON.parse(sndallInfo);
        if (parseInt(sndallInfo.version) >= currentVersion) {
            return;
        }
    }

    window.localStorage["sndallExtension"] = JSON.stringify({ version: currentVersion });
    window.location.reload();
})();
