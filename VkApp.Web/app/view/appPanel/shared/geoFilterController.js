function GeoFilterController(inputsHelper, regionsProvider) {
    return {
        init: function($element) {
            var inputs = inputsHelper.for($element);

            inputsHelper.initRowDisabling($element.find(".enableCountryCheckbox"), $element.find(".enableCountryCheckboxLabel"));
            inputsHelper.initRowDisabling($element.find(".enableCityCheckbox"), $element.find(".enableCityCheckboxLabel"));

            function initRegions() {
                function refreshCities() {
                    var countryId = inputs.getIntValue(".selectedCountry");
                    regionsProvider.getCities(countryId).then(function(cities) {
                        inputsHelper.renderOptions(
                            $element.find(".selectedCity"),
                            cities.items,
                            function(x) { return x.id; },
                            function(x) { return x.title; },
                            function(x) { return x.important; });
                    });
                }

                refreshCities();

                $element.find(".selectedCountry").on("change",
                    function() {
                        refreshCities();
                    });
            }

            initRegions();

            return {
                getSelections: function() {
                    var selections = {};

                    if (inputs.getChecked(".enableCountryCheckbox")) {
                        selections.country = inputs.getIntValue(".selectedCountry");
                        if (inputs.getChecked(".enableCityCheckbox")) {
                            selections.city = inputs.getIntValue(".selectedCity");
                        }
                    }

                    return selections;
                }
            };
        }
    };
}