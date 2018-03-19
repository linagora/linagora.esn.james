(function(angular) {
  'use strict';

  angular.module('linagora.esn.james')
    .factory('jamesWebadminClient', jamesWebadminClient);

  function jamesWebadminClient(
    esnConfigApi,
    jamesWebadminClientProvider,
    JAMES_MODULE_NAME
  ) {
    return {
      createDomain: createDomain,
      getServerUrl: getServerUrl,
      listDomains: listDomains,
      getUserQuota: getUserQuota,
      setUserQuota: setUserQuota
    };

    function createDomain(domainName) {
      return _getJamesClient()
        .then(function(jamesClient) {
          return jamesClient.createDomain(domainName);
        });
    }

    function getServerUrl() {
      return esnConfigApi.getPlatformConfigurations([{
        name: JAMES_MODULE_NAME,
        keys: ['webadminApiFrontend']
      }])
        .then(function(data) {
          return data[0] && data[0].configurations && data[0].configurations[0] && data[0].configurations[0].value;
        });
    }

    function listDomains() {
      return _getJamesClient()
        .then(function(jamesClient) {
          return jamesClient.listDomains();
        });
    }

    function getUserQuota(username) {
      return _getJamesClient()
        .then(function(jamesClient) {
          return jamesClient.getUserQuota(username)
            .then(function(data) {
              if (data) {
                return data.user || {};
              }

              return null;
            });
        });
    }

    function setUserQuota(username, quota) {
      return _getJamesClient()
        .then(function(jamesClient) {
          return jamesClient.setUserQuota(username, quota);
        });
    }

    function _getJamesClient() {
      return getServerUrl()
        .then(jamesWebadminClientProvider.get);
    }
  }
})(angular);
