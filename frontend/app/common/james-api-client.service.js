(function(angular) {
  'use strict';

  angular.module('linagora.esn.james')

  .factory('jamesApiClient', jamesApiClient);

  function jamesApiClient(jamesRestangular) {
    return {
      generateJwtToken: generateJwtToken
    };

    /**
     * Generate JWT to authenticate against James Webadmin APIs
     * @param  {String} domainId - (optional) The domain ID if the logged in user
     *                             is domain aministrator. Omit this if the logged
     *                             in user is platform administrator.
     * @return {Promise}          - On success, resolves with the response containing the token
     */
    function generateJwtToken(domainId) {
      return jamesRestangular.one('token').post(null, null, { domain_id: domainId });
    }
  }
})(angular);
