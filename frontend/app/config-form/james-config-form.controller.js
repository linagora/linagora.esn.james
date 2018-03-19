(function(angular) {
  'use strict';

  angular.module('linagora.esn.james')
    .controller('jamesConfigFormController', jamesConfigFormController);

  var CONNECTION_STATUS = {
    connecting: 'connecting',
    connected: 'connected',
    error: 'error'
  };

  function jamesConfigFormController(
    $q,
    jamesWebadminClientProvider,
    jamesQuotaHelpers
  ) {
    var self = this;

    self.$onInit = $onInit;
    self.onServerUrlChange = onServerUrlChange;

    function $onInit() {
      self.adminModulesDisplayerController.registerPostSaveHandler(_saveJamesConfigurations);

      if (self.configurations.webadminApiFrontend.value) {
        _connect();
      }
    }

    function onServerUrlChange(configForm) {
      configForm.$setPristine();
      _connect();
    }

    function _connect() {
      self.connectionStatus = CONNECTION_STATUS.connecting;
      self.config = {};

      return _getJamesConfigurations()
        .then(function(config) {
          self.config = config;
          self.connectionStatus = CONNECTION_STATUS.connected;
        })
        .catch(function() {
          self.connectionStatus = CONNECTION_STATUS.error;
        });
    }

    function _getJamesConfigurations() {
      return _getJamesClient()
        .then(function(jamesClient) {
          return $q.all([
            jamesClient.getQuota()
          ]);
        })
        .then(function(data) {
          var config = {
            quota: jamesQuotaHelpers.qualifyGet(data[0])
          };

          return config;
        });
    }

    function _saveJamesConfigurations() {
      if (self.connectionStatus !== CONNECTION_STATUS.connected) {
        return $q.when();
      }

      var config = {
        quota: jamesQuotaHelpers.qualifySet(self.config.quota)
      };

      return _getJamesClient()
        .then(function(jamesClient) {
          return $q.all([
            jamesClient.setQuota(config.quota)
          ]);
        });
    }

    function _getJamesClient() {
      return jamesWebadminClientProvider.get(self.configurations.webadminApiFrontend.value);
    }
  }
})(angular);
