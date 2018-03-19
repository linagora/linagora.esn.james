(function(angular) {
  'use strict';

  angular.module('linagora.esn.james')
    .component('jamesQuotaUser', {
      templateUrl: '/james/app/quota/user/james-quota-user.html',
      controller: 'jamesQuotaUserController',
      bindings: {
        user: '<'
      }
    });
})(angular);
