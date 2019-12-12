module.exports = (dependencies, lib, router) => {
  const authorizationMW = dependencies('authorizationMW');
  const {
    getQuota,
    setQuota
  } = require('./controller')(dependencies, lib);
  const {
    checkAuthorization,
    checkScopeIdInQuery,
    loadTargetScope,
    requireScopeQuery,
    validateQuota
  } = require('./middleware')(dependencies);

  /**
   * @swagger
   * /quota:
   *   get:
   *     tags:
   *       - Get quota
   *     description: Get quota
   *     parameters:
   *       - $ref: "#/parameters/james_quota_scope"
   *       - $ref: "#/parameters/james_quota_domain_id"
   *       - $ref: "#/parameters/james_quota_user_id"
   *     responses:
   *       200:
   *         $ref: "#/responses/james_quota"
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
  router.get('/quota',
    authorizationMW.requiresAPILogin,
    requireScopeQuery,
    checkScopeIdInQuery,
    loadTargetScope,
    checkAuthorization,
    getQuota);

/**
   * @swagger
   * /quota:
   *   put:
   *     tags:
   *       - Update quota
   *     description: Update quota
   *     parameters:
   *       - $ref: "#/parameters/james_quota_scope"
   *       - $ref: "#/parameters/james_quota_domain_id"
   *       - $ref: "#/parameters/james_quota_user_id"
   *       - $ref: "#/parameters/james_quota"
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
  router.put('/quota',
    authorizationMW.requiresAPILogin,
    requireScopeQuery,
    checkScopeIdInQuery,
    validateQuota,
    loadTargetScope,
    checkAuthorization,
    setQuota);
};
