(function(angular) {
  'use strict';

  angular.module('linagora.esn.james')
    .controller('jamesQuotaUserController', jamesUserQuotaController);

  function jamesUserQuotaController(
    asyncAction,
    jamesWebadminClient,
    jamesQuotaHelpers,
    userUtils
  ) {
    var self = this;

    self.updateUserQuota = updateUserQuota;
    self.init = init;

    function init() {
      self.status = 'loading';
      self.userDisplayName = userUtils.displayNameOf(self.user);

      return jamesWebadminClient.getUserQuota(self.user.emails[0])
        .then(function(quota) {
          self.quota = jamesQuotaHelpers.qualifyGet(quota);
          self.status = 'loaded';
        })
        .catch(function() {
          self.status = 'error';
        });
    }

    function updateUserQuota() {
      var notificationMessages = {
        progressing: 'Updating quota...',
        success: 'Quota updated',
        failure: 'Failed to update quota'
      };

      return asyncAction(notificationMessages, function() {
        return jamesWebadminClient.setUserQuota(self.user.emails[0], jamesQuotaHelpers.qualifySet(self.quota));
      });
    }
  }
})(angular);
