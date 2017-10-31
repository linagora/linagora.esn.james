'use strict';

angular.module('esn.router', []);
angular.module('esn.i18n', []);
angular.module('esn.http', [])
  .factory('httpErrorHandler', function() {
    return {
      redirectToLogin: angular.noop
    };
  });
