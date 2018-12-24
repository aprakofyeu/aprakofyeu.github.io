function RegionsProvider(callService, eventBroker) {

    cachedCities = {};

    function loadCities(countryId) {
        return callService.call("database.getCities",
            {
                country_id: countryId,
                count: 1000
            })
            .then(function (cities) {
                cachedCities[countryId] = cities;
                return cities;
            });
    }

    return {
        getCities: function (countryId) {
            if (cachedCities[cachedCities]) {
                var deferred = new $.Deferred();
                return deferred.resolve(cachedCities[cachedCities]);
            }

            return loadCities(countryId);
        }
    };
}