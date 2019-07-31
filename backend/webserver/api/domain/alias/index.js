module.exports = (dependencies, lib, router) => {
  const authorizationMW = dependencies('authorizationMW');
  const platformadminMW = dependencies('platformadminsMW');
  const domainMW = dependencies('domainMW');
  const controller = require('./controller')(dependencies, lib);
  const middleware = require('./middleware')(dependencies);

  router.get('/domains/:uuid/aliases',
    authorizationMW.requiresAPILogin,
    platformadminMW.requirePlatformAdmin,
    domainMW.load,
    controller.getDomainAliases
  );

  router.post('/domains/:uuid/aliases/:alias',
    authorizationMW.requiresAPILogin,
    platformadminMW.requirePlatformAdmin,
    domainMW.load,
    middleware.ensureAliasIsValidDomain,
    controller.addDomainAlias
  );

  router.delete('/domains/:uuid/aliases/:alias',
    authorizationMW.requiresAPILogin,
    platformadminMW.requirePlatformAdmin,
    domainMW.load,
    middleware.ensureAliasIsValidDomain,
    controller.removeDomainAlias
  );

  return router;
};
