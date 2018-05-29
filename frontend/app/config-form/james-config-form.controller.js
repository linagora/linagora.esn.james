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
    session,
    jamesWebadminClientProvider,
    jamesQuotaHelpers
  ) {
    var self = this;

    self.$onInit = $onInit;
    self.onServerUrlChange = onServerUrlChange;

    function $onInit() {
      self.adminModulesDisplayerController.registerPostSaveHandler(_saveJamesConfigurations);

      _connect();
    }

    function onServerUrlChange(configForm) {
      configForm.$setPristine();
      _connect();
    }

    function _connect() {
      if (!self.configurations.webadminApiFrontend.value) {
        return;
      }

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
          if (self.mode === self.availableModes.domain) {
            return $q.all([
              jamesClient.getDomainQuota(session.domain.name)
            ]);
          }

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
          if (self.mode === self.availableModes.domain) {
            return $q.all([
              jamesClient.setDomainQuota(session.domain.name, config.quota)
            ]);
          }

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
