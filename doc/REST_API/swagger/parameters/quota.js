/**
 * @swagger
 * parameter:
 *   james_quota_scope:
 *     name: scope
 *     in: query
 *     enum:
 *       - platform
 *       - domain
 *       - user
 *     description: scope when working with quota
 *     required: true
 *     type: string
 *   james_quota_user_id:
 *     name: user_id
 *     in: query
 *     description: target user id
 *     type: string
 *   james_quota_domain_id:
 *     name: domain_id
 *     in: query
 *     description: target domain id
 *     type: string
 *   james_quota:
 *     name: jame_quota
 *     in: body
 *     description: quota object <br>
 *       Remove quota count/size if its value is null <br>
 *       Set quota count/size to unlimited if its value is -1
 *     required: true
 *     schema:
 *       type: object
 *       properties:
 *         size:
 *           type: number
 *           x-nullable: true
 *         count:
 *           type: number
 *           x-nullable: true
**/
