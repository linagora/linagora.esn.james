/**
  * @swagger
  * response:
  *   james_group_status:
  *     description: Group status
  *     schema:
  *       type: object
  *       properties:
  *         ok:
  *           type: boolean
  *         notAddedMembers:
  *           type: array
  *           items:
  *             $ref: "#/definitions/james_group_member"
  *         notRemovedMembers:
  *           type: array
  *           items:
  *             $ref: "#/definitions/james_group_member"
  *     examples:
  *       application/json:
  *         {
  *           "ok": false,
  *           "notAddedMembers": ["user1@lng.com", "user2@lng.com"],
  *           "notRemovedMembers": ["user3@lng.com"]
  *         }
  */
