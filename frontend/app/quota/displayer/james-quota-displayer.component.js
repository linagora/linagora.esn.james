(function(angular) {
  'use strict';

  angular.module('linagora.esn.james')

    .component('jamesQuotaDisplayer', {
      templateUrl: '/james/app/quota/displayer/james-quota-displayer.html',
      bindings: {
        quota: '<'
      }
    });
})(angular);
