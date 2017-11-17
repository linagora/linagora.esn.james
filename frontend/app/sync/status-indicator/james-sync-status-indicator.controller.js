(function(angular) {
  'use strict';

  angular.module('linagora.esn.james')

  .controller('JamesSyncStatusIndicatorController', JamesSyncStatusIndicatorController);

  function JamesSyncStatusIndicatorController(
    jamesSynchronizerService
  ) {
    var self = this;
    var synchronizer;

    self.$onInit = $onInit;
    self.sync = sync;

    function $onInit() {
      self.syncError = false;
      synchronizer = jamesSynchronizerService.get(self.resourceType);

      if (!synchronizer) {
        throw new Error('No such resourceType:', self.resourceType);
      }

      self.errorMessage = synchronizer.errorMessage;
      _checkStatus();
    }

    function sync() {
      return synchronizer.sync(self.resourceId).then(_checkStatus);
    }

    function _checkStatus() {
      return synchronizer.getStatus(self.resourceId)
        .then(function(status) {
          self.syncError = !status.ok;
        })
        .catch(function() {
          self.syncError = true;
        });
    }
  }
})(angular);
