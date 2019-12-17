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
      getServerUrl: getServerUrl,
      getMailInMailRepository: getMailInMailRepository,
      listMailsInMailRepository: listMailsInMailRepository,
      reprocessAllMailsFromMailRepository: reprocessAllMailsFromMailRepository,
      reprocessMailFromMailRepository: reprocessMailFromMailRepository
    };

    function getServerUrl() {
      return esnConfig('linagora.esn.james.webadminApiFrontend');
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
