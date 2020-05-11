function ProgressBarHelper() {
    return {
        create: function (options) {
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
                status: { currentCount: 0, totalCount: options.totalCount ? options.totalCount : 0 },
                updateStatus: function (status) {
                    if (status) {
                        this.status = status;
                    } else {
                        if (this.status.currentCount < this.status.totalCount) {
                            this.status.currentCount += 1;
                        }
                    }
                    var value = Math.round(this.status.currentCount / this.status.totalCount * 100);
                    $progressbar.progressbar("value", value);
                }
            };
        }
    };
}