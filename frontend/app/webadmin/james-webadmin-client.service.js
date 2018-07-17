(function(angular) {
  'use strict';

  angular.module('linagora.esn.james')
    .factory('jamesWebadminClient', jamesWebadminClient);

  function jamesWebadminClient(
    $q,
    esnConfig,
    jamesWebadminClientProvider
  ) {
    return {
      createDomain: createDomain,
      getDomainQuota: getDomainQuota,
      getServerUrl: getServerUrl,
      getUserQuota: getUserQuota,
      getGlobalQuota: getGlobalQuota,
      setGlobalQuota: setGlobalQuota,
      listDomains: listDomains,
      setUserQuota: setUserQuota,
      setDomainQuota: setDomainQuota
    };

    function createDomain(domainName) {
      return _getJamesClient()
        .then(function(jamesClient) {
          return jamesClient.createDomain(domainName);
        });
    }

    function getServerUrl() {
      return esnConfig('linagora.esn.james.webadminApiFrontend');
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
          return jamesClient.getUserQuota(username);
        });
    }

    function setUserQuota(username, quota) {
      return _getJamesClient()
        .then(function(jamesClient) {
          var tasks = [];

          if (quota.count === null) {
            tasks.push(jamesClient.deleteUserQuotaCount(username));
          }

          if (quota.size === null) {
            tasks.push(jamesClient.deleteUserQuotaSize(username));
          }

          if (quota.count !== null || quota.size !== null) {
            tasks.push(jamesClient.setUserQuota(username, quota));
          }

          return $q.all(tasks);
        });
    }

    function getDomainQuota(domainName) {
      return _getJamesClient()
        .then(function(jamesClient) {
          return jamesClient.getDomainQuota(domainName);
        });
    }

    function getGlobalQuota() {
      return _getJamesClient()
        .then(function(jamesClient) {
          return jamesClient.getQuota();
        });
    }

    function setGlobalQuota(quota) {
      return _getJamesClient()
        .then(function(jamesClient) {
          var tasks = [];

          if (quota.count === null) {
            tasks.push(jamesClient.deleteQuotaCount());
          }

          if (quota.size === null) {
            tasks.push(jamesClient.deleteQuotaSize());
          }

          if (quota.count !== null || quota.size !== null) {
            tasks.push(jamesClient.setQuota(quota));
          }

          return $q.all(tasks);
        });
    }

    function setDomainQuota(domainName, quota) {
      return _getJamesClient()
        .then(function(jamesClient) {
          var tasks = [];

          if (quota.count === null) {
            tasks.push(jamesClient.deleteDomainQuotaCount(domainName));
          }

          if (quota.size === null) {
            tasks.push(jamesClient.deleteDomainQuotaSize(domainName));
          }

          if (quota.count !== null || quota.size !== null) {
            tasks.push(jamesClient.setDomainQuota(domainName, quota));
          }

          return $q.all(tasks);
        });
    }

    function _getJamesClient() {
      return getServerUrl()
        .then(jamesWebadminClientProvider.get);
    }
  }
})(angular);
