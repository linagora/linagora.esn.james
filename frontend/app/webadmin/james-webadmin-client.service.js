(function(angular) {
  'use strict';

  angular.module('linagora.esn.james')
    .factory('jamesWebadminClient', jamesWebadminClient);

  function jamesWebadminClient(
    esnConfig,
    FileSaver,
    jamesWebadminClientProvider
  ) {
    return {
      deleteMailInMailRepository: deleteMailInMailRepository,
      deleteAllMailsInMailRepository: deleteAllMailsInMailRepository,
      downloadEmlFileFromMailRepository: downloadEmlFileFromMailRepository,
      getDlpRule: getDlpRule,
      getServerUrl: getServerUrl,
      getMailInMailRepository: getMailInMailRepository,
      listDlpRules: listDlpRules,
      listMailRepositories: listMailRepositories,
      listMailsInMailRepository: listMailsInMailRepository,
      removeDlpRules: removeDlpRules,
      reprocessAllMailsFromMailRepository: reprocessAllMailsFromMailRepository,
      reprocessMailFromMailRepository: reprocessMailFromMailRepository,
      storeDlpRules: storeDlpRules
    };

    function getServerUrl() {
      return esnConfig('linagora.esn.james.webadminApiFrontend');
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

    function getDlpRule(domainName, ruleId) {
      return _getJamesClient()
        .then(function(jamesClient) {
          return jamesClient.dlpRules.get(domainName, ruleId);
        });
    }

    function _getJamesClient() {
      return getServerUrl()
        .then(jamesWebadminClientProvider.get);
    }
  }
})(angular);
