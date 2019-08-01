'use strict';

angular.module('esn.router', []);
angular.module('esn.session', [])
  .factory('session', function() {
    return {
      domain: {}
    };
  });
angular.module('esn.i18n', []);
angular.module('esn.http', [])
  .factory('httpErrorHandler', function() {
    return {
      redirectToLogin: angular.noop
    };
  });
angular.module('esn.async-action', [])
  .factory('asyncAction', function() {
    return function(message, action) {
      return action();
    };
  });
angular.module('esn.ui', []);

angular.module('esn.domain', [])
  .factory('domainAPI', function() {
    return {};
  });

angular.module('esn.module-registry', []);
angular.module('esn.configuration', [])
  .factory('esnConfigApi', function() {
    return {};
  });
angular.module('esn.user', [])
  .factory('userUtils', function() {
    return {
      displayNameOf: angular.noop
    };
  });
angular.module('ngFileSaver', [])
  .factory('FileSaver', function() {
    return {
      saveAs: angular.noop
    };
  });
