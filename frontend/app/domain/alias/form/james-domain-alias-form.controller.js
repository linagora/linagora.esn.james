(function(angular) {
  'use strict';

  angular.module('linagora.esn.james')
    .controller('JamesDomainAliasFormController', JamesDomainAliasFormController);

  function JamesDomainAliasFormController(
    $q,
    asyncAction,
    domainAPI,
    jamesApiClient
  ) {
    var self = this;

    self.$onInit = $onInit;

    function $onInit() {
      self.alias = '';
      self.checkAliasAvailability = checkAliasAvailability;
      self.aliasValidator = aliasValidator;
      self.onAddBtnClick = onAddBtnClick;
    }

    function checkAliasAvailability(alias) {
      return domainAPI.getByName(alias)
        .then(function(domain) {
          if (!domain) {
            return $q.reject(new Error('Alias must be an existing domain'));
          }
        });
    }

    function aliasValidator(alias) {
      function _aliasAlreadyExist() {
        return self.aliases.some(function(currentAlias) {
          return currentAlias === alias;
        });
      }

      if (self.domain.name === alias || _aliasAlreadyExist()) {
        return false;
      }

      return true;
    }

    function _addAlias() {
      return jamesApiClient.addDomainAlias(self.domain.id, self.alias).then(function() {
        self.aliases.push(self.alias);
        self.alias = '';
      });
    }

    function onAddBtnClick() {
      asyncAction({
        progressing: 'Adding alias...',
        success: 'Alias added',
        failure: 'Failed to add alias'
      }, _addAlias);
    }
  }
})(angular);
