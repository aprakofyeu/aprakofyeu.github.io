function InputsHelper(container) {
    return {
        renderOptions: function (items, getId, getTitle, selected) {
            return items.map(function (item) {
                return "<option value='" + getId(item) + "'" + (selected(item) ? " selected='selected'" : "") + ">" + getTitle(item) + "</option>";
            }).join("");
        },
        for: function (container) {
            function clearValidation() {
                $(this).removeClass("invalid");
            }

            container.find("input[type='text']").on("change", clearValidation);
            container.find("select").on("change", clearValidation);

            return {
                markAsInvalid: function (selector) {
                    container.find(selector).addClass("invalid");
                },
                getValue: function (selector) {
                    return container.find(selector).val();
                },
                getIntValue: function (selector) {
                    return parseInt(this.getValue(selector));
                },
                disable: function (selector) {
                    container.find(selector).attr("disabled", "disabled");
                },
                enable: function (selector) {
                    container.find(selector).removeAttr("disabled");
                }
            };
        }
    };
}