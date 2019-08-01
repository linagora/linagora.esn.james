(function(angular) {
  'use strict';

  angular.module('linagora.esn.james')
    .component('jamesDomainAlias', {
      templateUrl: '/james/app/domain/alias/james-domain-alias.html',
      controller: 'JamesDomainAliasController',
      bindings: {
        domain: '<'
      }
    });
})(angular);
