module.exports = (dependencies, lib, router) => {
  const authorizationMW = dependencies('authorizationMW');
  const domainMiddleware = dependencies('domainMiddleware');
  const controller = require('./controller')(dependencies, lib);
  const { validateRules } = require('./middleware')(dependencies);

  /**
   * @swagger
   * /dlp/domains/:uuid/rules/:ruleId:
   *   get:
   *     tags:
   *       - DLP
   *     description: Get a DLP rule of a domain
   *     parameters:
   *       - $ref: "#/parameters/dm_id"
   *     responses:
   *       200:
   *         $ref: "#/responses/james_dlp_rule"
   *       401:
   *         $ref: "#/responses/cm_401"
   *       403:
   *         $ref: "#/responses/cm_403"
   *       404:
   *         $ref: "#/responses/cm_404"
   *       500:
   *         $ref: "#/responses/cm_500"
   */
  router.get('/dlp/domains/:uuid/rules/:ruleId',
    authorizationMW.requiresAPILogin,
    domainMiddleware.load,
    authorizationMW.requiresDomainManager,
    controller.getRule
  );

  /**
   * @swagger
   * /dlp/domains/:uuid/rules:
   *   get:
   *     tags:
   *       - DLP
   *     description: List DLP rules of a domain
   *     parameters:
   *       - $ref: "#/parameters/dm_id"
   *     responses:
   *       200:
   *         $ref: "#/responses/james_dlp_rules"
   *       401:
   *         $ref: "#/responses/cm_401"
   *       403:
   *         $ref: "#/responses/cm_403"
   *       404:
   *         $ref: "#/responses/cm_404"
   *       500:
   *         $ref: "#/responses/cm_500"
   */
  router.get('/dlp/domains/:uuid/rules',
    authorizationMW.requiresAPILogin,
    domainMiddleware.load,
    authorizationMW.requiresDomainManager,
    controller.listRules
  );

  /**
   * @swagger
   * /dlp/domains/:uuid/rules:
   *   put:
   *     tags:
   *       - DLP
   *     description: Update DLP rules of a domain
   *     parameters:
   *       - $ref: "#/parameters/dm_id"
   *       - $ref: "#/parameters/james_dlp_rules"
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
  router.put('/dlp/domains/:uuid/rules',
    authorizationMW.requiresAPILogin,
    domainMiddleware.load,
    authorizationMW.requiresDomainManager,
    validateRules,
    controller.storeRules
  );

  return router;
};
