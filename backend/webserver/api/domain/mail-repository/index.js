module.exports = (dependencies, lib, router) => {
  const authorizationMW = dependencies('authorizationMW');
  const domainMW = dependencies('domainMW');
  const controller = require('./controller')(dependencies, lib);
  const { loadRepositoryPath } = require('./middleware')(dependencies, lib);

  /**
   * @swagger
   * /domains/:uuid/mailRepositories/:repository/mails:
   *   get:
   *     tags:
   *       - Mail repositories
   *     description: List mails from a repository
   *     parameters:
   *       - $ref: "#/parameters/dm_id"
   *       - $ref: "#/parameters/james_mail_repository"
   *       - $ref: "#/parameters/cm_offset"
   *       - $ref: "#/parameters/cm_limit"
   *     responses:
   *       200:
   *         $ref: "#/responses/james_mail_repository_mails"
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
  router.get('/domains/:uuid/mailRepositories/:repository/mails',
    authorizationMW.requiresAPILogin,
    domainMW.load,
    loadRepositoryPath,
    authorizationMW.requiresDomainManager,
    controller.listMails);

  /**
   * @swagger
   * /domains/:uuid/mailRepositories/:repository/mails/:mailKey:
   *   get:
   *     tags:
   *       - Mail repositories
   *     description: Get/Download a specific mail from a mail repository<br>
   *       If the Accept header in the request is "message/rfc822", then the response will be the eml file itself
   *     parameters:
   *       - $ref: "#/parameters/dm_id"
   *       - $ref: "#/parameters/james_mail_repository"
   *       - $ref: "#/parameters/james_mail_repository_mail_key"
   *       - $ref: "#/parameters/james_mail_repository_additional_fields"
   *       - $ref: "#/parameters/james_mail_repository_header_accept"
   *     responses:
   *       200:
   *         $ref: "#/responses/james_mail_repository_mail"
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
  router.get('/domains/:uuid/mailRepositories/:repository/mails/:mailKey',
    authorizationMW.requiresAPILogin,
    domainMW.load,
    loadRepositoryPath,
    authorizationMW.requiresDomainManager,
    controller.getMail);

  /**
   * @swagger
   * /domains/:uuid/mailRepositories/:repository/mails/:mailKey:
   *   delete:
   *     tags:
   *       - Mail repositories
   *     description: Remove a specific mail from a mail repository
   *     parameters:
   *       - $ref: "#/parameters/dm_id"
   *       - $ref: "#/parameters/james_mail_repository"
   *       - $ref: "#/parameters/james_mail_repository_mail_key"
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
  router.delete('/domains/:uuid/mailRepositories/:repository/mails/:mailKey',
    authorizationMW.requiresAPILogin,
    domainMW.load,
    loadRepositoryPath,
    authorizationMW.requiresDomainManager,
    controller.removeMail);

  /**
   * @swagger
   * /domains/:uuid/mailRepositories/:repository/mails:
   *   delete:
   *     tags:
   *       - Mail repositories
   *     description: Remove all mails from a mail repository
   *     parameters:
   *       - $ref: "#/parameters/dm_id"
   *       - $ref: "#/parameters/james_mail_repository"
   *     responses:
   *       201:
   *         $ref: "#/responses/james_mail_repository_task"
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
  router.delete('/domains/:uuid/mailRepositories/:repository/mails',
    authorizationMW.requiresAPILogin,
    domainMW.load,
    loadRepositoryPath,
    authorizationMW.requiresDomainManager,
    controller.removeAllMails);

  /**
   * @swagger
   * /domains/:uuid/mailRepositories/:repository/mails:
   *   patch:
   *     tags:
   *       - Mail repositories
   *     description: Reprocessing all mails from a mail repository
   *     parameters:
   *       - $ref: "#/parameters/dm_id"
   *       - $ref: "#/parameters/james_mail_repository"
   *       - $ref: "#/parameters/james_mail_repository_reprocess_processor"
   *       - $ref: "#/parameters/james_mail_repository_reprocess_queue"
   *     responses:
   *       201:
   *         $ref: "#/responses/james_mail_repository_task"
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
  router.patch('/domains/:uuid/mailRepositories/:repository/mails',
    authorizationMW.requiresAPILogin,
    domainMW.load,
    loadRepositoryPath,
    authorizationMW.requiresDomainManager,
    controller.reprocessAllMails);

  /**
   * @swagger
   * /domains/:uuid/mailRepositories/:repository/mails/:mailKey:
   *   patch:
   *     tags:
   *       - Mail repositories
   *     description: Reprocessing a specific mail from a mail repository
   *     parameters:
   *       - $ref: "#/parameters/dm_id"
   *       - $ref: "#/parameters/james_mail_repository"
   *       - $ref: "#/parameters/james_mail_repository_mail_key"
   *       - $ref: "#/parameters/james_mail_repository_reprocess_processor"
   *       - $ref: "#/parameters/james_mail_repository_reprocess_queue"
   *     responses:
   *       201:
   *         $ref: "#/responses/james_mail_repository_task"
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
  router.patch('/domains/:uuid/mailRepositories/:repository/mails/:mailKey',
    authorizationMW.requiresAPILogin,
    domainMW.load,
    loadRepositoryPath,
    authorizationMW.requiresDomainManager,
    controller.reprocessMail);

  return router;
};
