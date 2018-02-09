(function(angular) {
  'use strict';

  angular.module('linagora.esn.james')

  .factory('jamesWebadminClientTransport', function($http) {
    return {
      get: function(url, headers) {
        return $http.get(url, {headers: headers}).then(function(response) {
          return response.data;
        });
      },
      put: function(url, headers, data) {
        return $http.put(url, data, {headers: headers}).then(function(response) {
          return response.data;
        });
      }
    };
  });
})(angular);
