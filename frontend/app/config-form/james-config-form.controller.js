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
    jamesClientProvider
  ) {
    var self = this;
    var ACTION_DEFAULT_VALUE = { get: null, set: -1 };

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
            quota: data[0]
          };

          return _qualifyJamesConfig(config);
        });
    }

    function _saveJamesConfigurations() {
      if (self.connectionStatus !== CONNECTION_STATUS.connected) {
        return $q.when();
      }

      var config = _qualifyJamesConfig(self.config, ACTION_DEFAULT_VALUE.set);

      return _getJamesClient()
        .then(function(jamesClient) {
          return $q.all([
            jamesClient.setQuota(config.quota)
          ]);
        });
    }

    function _getJamesClient() {
      return jamesClientProvider.get(self.configurations.webadminApiFrontend.value);
    }

    function _qualifyJamesConfig(config, defaultValue) {
      defaultValue = defaultValue || ACTION_DEFAULT_VALUE.get;
      var cf = angular.copy(config);

      if (cf.quota) {
        cf.quota.size = cf.quota.size > 0 ? cf.quota.size : defaultValue;
        cf.quota.count = cf.quota.count > 0 ? cf.quota.count : defaultValue;
      }

      return cf;
    }
  }
})(angular);
