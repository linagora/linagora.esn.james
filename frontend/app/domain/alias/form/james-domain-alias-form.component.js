(function(angular) {
  'use strict';

  angular.module('linagora.esn.james')
    .component('jamesDomainAliasForm', {
      templateUrl: '/james/app/domain/alias/form/james-domain-alias-form.html',
      controller: 'JamesDomainAliasFormController',
      bindings: {
        domain: '<',
        aliases: '='
      }
    });
})(angular);
