(function(angular) {
  'use strict';

  angular.module('linagora.esn.james')
    .component('jamesConfigForm', {
      templateUrl: '/james/app/config-form/james-config-form.html',
      controller: 'jamesConfigFormController',
      bindings: {
        configurations: '='
      },
      require: {
        adminModulesDisplayerController: '^adminModulesDisplayer'
      }
    });
})(angular);
