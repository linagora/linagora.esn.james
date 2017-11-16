'use strict';

module.exports = function(dependencies, lib, router) {
  const authorizationMW = dependencies('authorizationMW');
  const helperMW = dependencies('helperMW');
  const controller = require('./controller')(dependencies, lib);
  const middleware = require('./middleware')(dependencies);

  router.get('/sync/groups/:groupId',
    authorizationMW.requiresAPILogin,
    helperMW.checkIdInParams('groupId', 'Group'),
    middleware.loadGroup,
    controller.getGroupSyncStatus);

  router.post('/sync/groups/:groupId',
    authorizationMW.requiresAPILogin,
    helperMW.checkIdInParams('groupId', 'Group'),
    middleware.loadGroup,
    controller.syncGroup);

  return router;
};
