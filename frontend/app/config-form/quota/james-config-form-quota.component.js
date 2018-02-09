(function(angular) {

  angular.module('linagora.esn.james')

  .component('jamesConfigFormQuota', {
    templateUrl: '/james/app/config-form/quota/james-config-form-quota.html',
    bindings: {
      quota: '='
    }
  });

})(angular);
