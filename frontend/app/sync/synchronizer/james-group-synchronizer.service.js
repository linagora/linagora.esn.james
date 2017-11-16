(function(angular) {
  'use strict';

  angular.module('linagora.esn.james')

  .factory('jamesGroupSynchronizer', jamesGroupSynchronizer);

  function jamesGroupSynchronizer(
    asyncAction,
    jamesApiClient
  ) {
    return {
      getStatus: getStatus,
      sync: sync,
      errorMessage: 'This group data does not synchronize with mail group in James.'
    };

    function getStatus(groupId) {
      return jamesApiClient.getGroupSyncStatus(groupId).then(function(response) {
        return response.data;
      });
    }

    function sync(groupId) {
      var notificationMessages = {
        progressing: 'Synchronizing group...',
        success: 'Group synchronized',
        failure: 'Failed to synchronize group'
      };

      return asyncAction(notificationMessages, function() {
        return jamesApiClient.syncGroup(groupId);
      });
    }
  }
})(angular);
