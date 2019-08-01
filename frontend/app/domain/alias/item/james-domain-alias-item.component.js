(function(angular) {
  'use strict';

  angular.module('linagora.esn.james')
    .component('jamesDomainAliasItem', {
      templateUrl: '/james/app/domain/alias/item/james-domain-alias-item.html',
      controller: 'JamesDomainAliasItemController',
      bindings: {
        alias: '<',
        aliases: '=',
        domain: '<'
      }
    });
})(angular);
