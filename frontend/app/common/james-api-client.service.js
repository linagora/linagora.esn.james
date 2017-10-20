(function(angular) {
  'use strict';

  angular.module('linagora.esn.james')

  .factory('jamesApiClient', jamesApiClient);

  function jamesApiClient(jamesRestangular) {
    return {
      generateJwtToken: generateJwtToken
    };

    /**
     * Generate JWT token
     * @return {Promise}                         Resolve response with the JWT token
     */
    function generateJwtToken() {
      return jamesRestangular.one('generateJwtToken').post();
    }
  }
})(angular);
