function DateFormatter() {
    return {
        toNumber: function(date) {
            return date.getTime() / 1000;
        },
        fromNumber: function(number) {
            return new Date(number * 1000);
        }
    };
}