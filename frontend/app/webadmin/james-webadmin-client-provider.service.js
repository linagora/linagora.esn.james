(function(angular) {
  'use strict';

  angular.module('linagora.esn.james')

  .factory('jamesWebadminClientProvider', function(jamesApiClient, james, jamesWebadminClientTransport) {
    var cachedPromise;

    function get(apiUrl) {
      if (!cachedPromise) {
        cachedPromise = jamesApiClient.generateJwtToken();
      }

      return cachedPromise.then(function(resp) {
        var token = resp.data;
        var options = {
          httpClient: jamesWebadminClientTransport,
          promiseProvider: null,
          apiUrl: apiUrl,
          token: token
        };

        return new james.Client(options);
      });
    }

    return {
      get: get
    };
  });
})(angular);
