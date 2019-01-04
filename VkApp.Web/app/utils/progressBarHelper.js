function ProgressBarHelper() {
    return {
        create: function(options) {
            var $progressbar = options.element;

            $progressbar.progressbar({
                max: 100,
                value: 0,
                change: function () {
                    var value = $progressbar.progressbar("value");
                    $(this).find(".progress-label").text("Готово на " + value + "%");
                },
                complete: function () {
                    $(this).find(".progress-label").text(options.completeLabel);
                }
            });

            return {
                updateStatus: function(status) {
                    var value = Math.round(status.currentCount / status.totalCount * 100);
                    $progressbar.progressbar("value", value);
                }
            };
        }
    };
}