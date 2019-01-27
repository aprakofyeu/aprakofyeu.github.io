function InputsHelper() {
    return {
        renderOptions: function ($element, items, getId, getTitle, selected) {
            var optionsHtml = items.map(function (item) {
                return "<option value='" + getId(item) + "'" + (selected(item) ? " selected='selected'" : "") + ">" + getTitle(item) + "</option>";
            }).join("");

            $element.html(optionsHtml);
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
                setValue: function(selector, value) {
                    container.find(selector).val(value);
                },
                clear: function(selector) {
                    container.find(selector).val("");
                },
                getIntValue: function (selector) {
                    return parseInt(this.getValue(selector));
                },
                getChecked: function (selector) {
                    return !!container.find(selector)[0].checked;
                },
                setChecked: function (selector, value) {
                    if (value) {
                        container.find(selector).attr("checked", "checked");
                    } else {
                        container.find(selector).removeAttr("checked");
                    }
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