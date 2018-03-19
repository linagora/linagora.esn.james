(function(angular) {
  'use strict';

  angular.module('linagora.esn.james')
    .component('jamesQuotaDomain', {
      templateUrl: '/james/app/quota/domain/james-quota-domain.html',
      controller: 'JamesQuotaDomainController',
      bindings: {
        domain: '<'
      }
    });
})(angular);
