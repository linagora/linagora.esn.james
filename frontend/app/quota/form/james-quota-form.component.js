(function(angular) {
  'use strict';

  angular.module('linagora.esn.james')

  .component('jamesQuotaForm', {
    templateUrl: '/james/app/quota/form/james-quota-form.html',
    bindings: {
      quota: '='
    }
  });
})(angular);
