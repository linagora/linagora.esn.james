module.exports = (dependencies, lib, router) => {
  const authorizationMW = dependencies('authorizationMW');
  const platformadminMW = dependencies('platformadminsMW');
  const domainMW = dependencies('domainMW');
  const controller = require('./controller')(dependencies, lib);
  const middleware = require('./middleware')(dependencies);

  /**
   * @swagger
   * /domains/:uuid/aliases:
   *   get:
   *     tags:
   *       - Domain aliases
   *     description: Get domain aliases
   *     parameters:
   *       - $ref: "#/parameters/dm_id"
   *     responses:
   *       200:
   *         $ref: "#/responses/james_domain_aliases"
   *       400:
   *         $ref: "#/responses/cm_400"
   *       401:
   *         $ref: "#/responses/cm_401"
   *       403:
   *         $ref: "#/responses/cm_403"
   *       404:
   *         $ref: "#/responses/cm_404"
   *       500:
   *         $ref: "#/responses/cm_500"
   */
  router.get('/domains/:uuid/aliases',
    authorizationMW.requiresAPILogin,
    platformadminMW.requirePlatformAdmin,
    domainMW.load,
    controller.getDomainAliases
  );

  /**
   * @swagger
   * /domains/:uuid/aliases/:alias:
   *   post:
   *     tags:
   *       - Domain aliases
   *     description: Add an alias for a particular domain
   *     parameters:
   *       - $ref: "#/parameters/dm_id"
   *       - $ref: "#/parameters/james_domain_alias"
   *     responses:
   *       204:
   *         $ref: "#/responses/cm_204"
   *       400:
   *         $ref: "#/responses/cm_400"
   *       401:
   *         $ref: "#/responses/cm_401"
   *       403:
   *         $ref: "#/responses/cm_403"
   *       404:
   *         $ref: "#/responses/cm_404"
   *       500:
   *         $ref: "#/responses/cm_500"
   */
  router.post('/domains/:uuid/aliases/:alias',
    authorizationMW.requiresAPILogin,
    platformadminMW.requirePlatformAdmin,
    domainMW.load,
    middleware.ensureAliasIsValidDomain,
    controller.addDomainAlias
  );

  /**
   * @swagger
   * /domains/:uuid/aliases/:alias:
   *   delete:
   *     tags:
   *       - Domain aliases
   *     description: Remove an alias from a particular domain
   *     parameters:
   *       - $ref: "#/parameters/dm_id"
   *       - $ref: "#/parameters/james_domain_alias"
   *     responses:
   *       204:
   *         $ref: "#/responses/cm_204"
   *       400:
   *         $ref: "#/responses/cm_400"
   *       401:
   *         $ref: "#/responses/cm_401"
   *       403:
   *         $ref: "#/responses/cm_403"
   *       404:
   *         $ref: "#/responses/cm_404"
   *       500:
   *         $ref: "#/responses/cm_500"
   */
  router.delete('/domains/:uuid/aliases/:alias',
    authorizationMW.requiresAPILogin,
    platformadminMW.requirePlatformAdmin,
    domainMW.load,
    middleware.ensureAliasIsValidDomain,
    controller.removeDomainAlias
  );

  return router;
};
