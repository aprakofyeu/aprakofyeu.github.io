(function () {
    if (!window.localStorage["sndallExtension"]) {
        window.localStorage["sndallExtension"] = JSON.stringify({ version: 1 });
        window.location.reload();
    }
})();
