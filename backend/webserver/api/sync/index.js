module.exports = (dependencies, lib, router) => {
  const authorizationMW = dependencies('authorizationMW');
  const platformadminMW = dependencies('platformadminsMW');
  const helperMW = dependencies('helperMW');
  const controller = require('./controller')(dependencies, lib);
  const middleware = require('./middleware')(dependencies);

  /**
   * @swagger
   * /sync/groups/:groupId:
   *   get:
   *     tags:
   *       - Groups
   *     description: Get synchronizing status of a particular group
   *     parameters:
   *       - $ref: "#/parameters/group_id"
   *     responses:
   *       200:
   *         $ref: "#/responses/group_status"
   *       400:
   *         $ref: "#/responses/cm_400"
   *       401:
   *         $ref: "#/responses/cm_401"
   *       404:
   *         $ref: "#/responses/cm_404"
   *       500:
   *         $ref: "#/responses/cm_500"
   */
  router.get('/sync/groups/:groupId',
    authorizationMW.requiresAPILogin,
    helperMW.checkIdInParams('groupId', 'Group'),
    middleware.loadGroup,
    controller.getGroupSyncStatus);

  /**
   * @swagger
   * /sync/groups/:groupId:
   *   post:
   *     tags:
   *       - Groups
   *     description: Synchronize a particular group between ESN and James
   *     parameters:
   *       - $ref: "#/parameters/group_id"
   *     responses:
   *       204:
   *         $ref: "#/responses/cm_204"
   *       400:
   *         $ref: "#/responses/cm_400"
   *       401:
   *         $ref: "#/responses/cm_401"
   *       404:
   *         $ref: "#/responses/cm_404"
   *       500:
   *         $ref: "#/responses/cm_500"
   */
  router.post('/sync/groups/:groupId',
    authorizationMW.requiresAPILogin,
    helperMW.checkIdInParams('groupId', 'Group'),
    middleware.loadGroup,
    controller.syncGroup);

  /**
   * @swagger
   * /sync/domains:
   *   get:
   *     tags:
   *       - Synchronizing domains
   *     description: Get synchronizing status of the ESN domanis
   *     responses:
   *       200:
   *         $ref: "#/responses/domain_status"
   *       401:
   *         $ref: "#/responses/cm_401"
   *       403:
   *         $ref: "#/responses/cm_403"
   *       500:
   *         $ref: "#/responses/cm_500"
   */
  router.get('/sync/domains',
    authorizationMW.requiresAPILogin,
    platformadminMW.requirePlatformAdmin,
    controller.getDomainsSyncStatus);

  /**
   * @swagger
   * /sync/domains:
   *   post:
   *     tags:
   *       - Synchronizing domains
   *     description: Synchronize domains between ESN and James
   *     responses:
   *       204:
   *         $ref: "#/responses/cm_204"
   *       401:
   *         $ref: "#/responses/cm_401"
   *       403:
   *         $ref: "#/responses/cm_403"
   *       500:
   *         $ref: "#/responses/cm_500"
   */
  router.post('/sync/domains',
    authorizationMW.requiresAPILogin,
    platformadminMW.requirePlatformAdmin,
    controller.syncDomains);

  return router;
};
