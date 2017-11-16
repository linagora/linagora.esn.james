(function(angular) {
  'use strict';

  angular.module('linagora.esn.james')

  .component('jamesSyncStatusIndicator', {
    templateUrl: '/james/app/sync/status-indicator/james-sync-status-indicator.html',
    bindings: {
      resourceType: '@',
      resourceId: '@'
    },
    controller: 'JamesSyncStatusIndicatorController'
  });
})(angular);
