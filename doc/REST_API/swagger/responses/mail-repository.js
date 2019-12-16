/**
  * @swagger
  * response:
  *   james_mail_repository_mails:
  *     description: List of mails from a mail repository
  *     schema:
  *       type: array
  *       items:
  *         $ref: "#/definitions/james_mail_repository_mail"
  *     examples:
  *       application/json:
  *         [{
  *           "name": "mail-key-1",
  *           "sender": "sender@domain.com",
  *           "recipients": ["recipient1@domain.com", "recipient2@domain.com"],
  *           "state": "address-error",
  *           "error": "A small message explaining what happened to that mail...",
  *           "remoteHost": "111.222.333.444",
  *           "remoteAddr": "127.0.0.1",
  *           "lastUpdated": null
  *         }]
  *   james_mail_repository_mail:
  *     description: List of mails from a mail repository
  *     schema:
  *       $ref: "#/definitions/james_mail_repository_mail"
  *     examples:
  *       application/json:
  *         {
  *           "name": "mail-key-1",
  *           "sender": "sender@domain.com",
  *           "recipients": ["recipient1@domain.com", "recipient2@domain.com"],
  *           "state": "address-error",
  *           "error": "A small message explaining what happened to that mail...",
  *           "remoteHost": "111.222.333.444",
  *           "remoteAddr": "127.0.0.1",
  *           "lastUpdated": null
  *         }
  *   james_mail_repository_task:
  *     description: submitted task
  *     schema:
  *       type: object
  *       properties:
  *         taskId:
  *           type: string
  *     examples:
  *       application/json:
  *         {"taskId":"5641376-02ed-47bd-bcc7-76ff6262d92a"}
  */
