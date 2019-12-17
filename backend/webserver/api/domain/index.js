module.exports = (dependencies, lib, router) => {
  require('./alias')(dependencies, lib, router);
  require('./mail-repository')(dependencies, lib, router);

  const authorizationMW = dependencies('authorizationMW');
  const platformadminMW = dependencies('platformadminsMW');
  const controller = require('./controller')(dependencies, lib);

  /**
   * @swagger
   * /domains:
   *   get:
   *     tags:
   *       - Domain
   *     description: List domains from James server
   *     responses:
   *       200:
   *         $ref: "#/responses/james_domains"
   *       401:
   *         $ref: "#/responses/cm_401"
   *       403:
   *         $ref: "#/responses/cm_403"
   *       500:
   *         $ref: "#/responses/cm_500"
   */
  router.get('/domains',
    authorizationMW.requiresAPILogin,
    platformadminMW.requirePlatformAdmin,
    controller.listDomains
  );
};
