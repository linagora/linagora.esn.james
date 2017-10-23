'use strict';

module.exports = function(dependencies, lib, router) {
  const authorizationMW = dependencies('authorizationMW');
  const platformadminsMW = dependencies('platformadminsMW');
  const controller = require('./controller')(dependencies);

  router.post('/generateJwtToken',
    authorizationMW.requiresAPILogin,
    platformadminsMW.requirePlatformAdmin,
    controller.generateJwtToken);

  return router;
};
