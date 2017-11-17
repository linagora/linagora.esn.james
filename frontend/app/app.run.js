(function(angular) {
  'use strict';

  angular.module('linagora.esn.james')

  .run(function(dynamicDirectiveService) {
    var syncStatusIndicator = new dynamicDirectiveService.DynamicDirective(true, 'james-sync-status-indicator', {
      attributes: [
        {
          name: 'ng-if',
          value: '$ctrl.group'
        },
        {
          name: 'resource-type',
          value: 'group'
        },
        {
          name: 'resource-id',
          value: '{{$ctrl.group.id}}'
        }
      ]
    });

    dynamicDirectiveService.addInjection('group-display-subheader-actions', syncStatusIndicator);
  });
})(angular);
