(function(angular) {
  'use strict';

  angular.module('linagora.esn.james')
    .factory('jamesWebadminClient', jamesWebadminClient);

  function jamesWebadminClient(
    $q,
    esnConfig,
    FileSaver,
    jamesWebadminClientProvider
  ) {
    return {
      createDomain: createDomain,
      deleteMailInMailRepository: deleteMailInMailRepository,
      deleteAllMailsInMailRepository: deleteAllMailsInMailRepository,
      downloadEmlFileFromMailRepository: downloadEmlFileFromMailRepository,
      getDomainQuota: getDomainQuota,
      getServerUrl: getServerUrl,
      getUserQuota: getUserQuota,
      getGlobalQuota: getGlobalQuota,
      getMailInMailRepository: getMailInMailRepository,
      setGlobalQuota: setGlobalQuota,
      listDlpRules: listDlpRules,
      listDomains: listDomains,
      listMailRepositories: listMailRepositories,
      listMailsInMailRepository: listMailsInMailRepository,
      removeDlpRules: removeDlpRules,
      reprocessAllMailsFromMailRepository: reprocessAllMailsFromMailRepository,
      reprocessMailFromMailRepository: reprocessMailFromMailRepository,
      setUserQuota: setUserQuota,
      setDomainQuota: setDomainQuota,
      storeDlpRules: storeDlpRules
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

    function listMailRepositories() {
      return _getJamesClient()
        .then(function(jamesClient) {
          return jamesClient.mailRepositories.list();
        });
    }

    function listMailsInMailRepository(repositoryId, options) {
      return _getJamesClient()
        .then(function(jamesClient) {
          return jamesClient.mailRepositories.getMails(repositoryId, options);
        });
    }

    function getMailInMailRepository(repositoryId, mailKey, options) {
      return _getJamesClient()
        .then(function(jamesClient) {
          return jamesClient.mailRepositories.getMail(repositoryId, mailKey, options);
        });
    }

    function downloadEmlFileFromMailRepository(repositoryId, mailKey) {
      return _getJamesClient()
        .then(function(jamesClient) {
          return jamesClient.mailRepositories.downloadEmlFile(repositoryId, mailKey).then(function(response) {
            FileSaver.saveAs(response, [mailKey, 'eml'].join('.'));
          });
        });
    }

    function listDlpRules(domainName) {
      return _getJamesClient()
        .then(function(jamesClient) {
          return jamesClient.dlpRules.list(domainName);
        })
        .then(function(data) {
          return data.rules;
        });
    }

    function storeDlpRules(domainName, rules) {
      return _getJamesClient()
        .then(function(jamesClient) {
          return jamesClient.dlpRules.store(domainName, { rules: rules });
        });
    }

    function removeDlpRules(domainName) {
      return _getJamesClient()
        .then(function(jamesClient) {
          return jamesClient.dlpRules.remove(domainName);
        });
    }

    function deleteMailInMailRepository(repositoryId, mailKey) {
      return _getJamesClient()
        .then(function(jamesClient) {
          return jamesClient.mailRepositories.removeMail(repositoryId, mailKey);
        });
    }

    function deleteAllMailsInMailRepository(repositoryId) {
      return _getJamesClient()
        .then(function(jamesClient) {
          return jamesClient.mailRepositories.removeAllMails(repositoryId);
        });
    }

    function reprocessAllMailsFromMailRepository(repositoryId, options) {
      return _getJamesClient()
        .then(function(jamesClient) {
          return jamesClient.mailRepositories.reprocessAllMails(repositoryId, options);
        });
    }

    function reprocessMailFromMailRepository(repositoryId, mailKey, options) {
      return _getJamesClient()
        .then(function(jamesClient) {
          return jamesClient.mailRepositories.reprocessMail(repositoryId, mailKey, options);
        });
    }

    function _getJamesClient() {
      return getServerUrl()
        .then(jamesWebadminClientProvider.get);
    }
  }
})(angular);
