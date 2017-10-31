'use strict';

module.exports = function(dependencies, lib, router) {
  const authorizationMW = dependencies('authorizationMW');
  const controller = require('./controller')(dependencies);
  const middleware = require('./middleware')(dependencies);

  router.post('/token',
    authorizationMW.requiresAPILogin,
    middleware.canGenerateToken,
    controller.generateJwtToken);

  return router;
};
