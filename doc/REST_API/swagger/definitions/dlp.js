/**
  * @swagger
  * definition:
  *   james_dlp_rules:
  *     description: James dlp rules list
  *     type: array
  *     items:
  *       $ref: "#/definitions/james_dlp_rule"
  *
  *   james_dlp_rule:
  *     description: James dlp rule
  *     type: object
  *     properties:
  *       id:
  *         type: string
  *       expression:
  *         type: string
  *       explanation:
  *         type: string
  *       targetsSender:
  *         type: boolean
  *       targetsRecipients:
  *         type: boolean
  *       targetsContent:
  *         type: boolean
*/
