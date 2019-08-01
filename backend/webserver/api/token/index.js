module.exports = (dependencies, lib, router) => {
  const authorizationMW = dependencies('authorizationMW');
  const domainMW = dependencies('domainMW');
  const controller = require('./controller')(dependencies);
  const middleware = require('./middleware')(dependencies);

  /**
   * @swagger
   * /token:
   *   post:
   *     tags:
   *       - JWT token
   *     description: Generate admin JWT to access to James under admin role
   *     responses:
   *       200:
   *         $ref: "#/responses/james_token"
   *       401:
   *         $ref: "#/responses/cm_401"
   *       403:
   *         $ref: "#/responses/cm_403"
   *       404:
   *         $ref: "#/responses/cm_404"
   *       500:
   *         $ref: "#/responses/cm_500"
   */
  router.post('/token',
    authorizationMW.requiresAPILogin,
    domainMW.loadSessionDomain,
    middleware.canGenerateToken,
    controller.generateJwtToken);

  return router;
};
