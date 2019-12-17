/**
 * @swagger
 * parameter:
 *   james_mail_repository:
 *     name: repository
 *     description: name of the repository
 *     in: path
 *     enum:
 *       - dlpQuarantine
 *       - dlpRejected
 *     required: true
 *     type: string
 *   james_mail_repository_mail_key:
 *     name: mailKey
 *     description: mail key of a email
 *     in: path
 *     required: true
 *     type: string
 *   james_mail_repository_additional_fields:
 *     name: additionalFields
 *     description: When reading a mail, additional query parameter additionalFields add the existing information to the response for the supported values:<br>
 *       - attributes<br>
 *       - headers<br>
 *       - textBody<br>
 *       - htmlBody<br>
 *       - messageSize<br>
 *       - perRecipientsHeaders
 *     in: query
 *     type: string
 *   james_mail_repository_reprocess_processor:
 *     name: processor
 *     description: When reprocessing emails, processor param allows you to overwrite the state of the reprocessing mails, and thus select the processors they will start their processing in
 *     in: query
 *     type: string
 *   james_mail_repository_reprocess_queue:
 *     name: queue
 *     description: When reprocessing emails, queue param allows you to target the mail queue you want to enqueue the mails in
 *     in: query
 *     type: string
 *   james_mail_repository_header_accept:
 *     name: Accept
 *     in: header
 *     type: string
 *     required: true
 *     enum:
 *       - application/json
 *       - message/rfc822
**/
