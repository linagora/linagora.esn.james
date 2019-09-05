/**
  * @swagger
  * response:
  *   james_domains:
  *     description: List of domains
  *     schema:
  *       type: array
  *       items:
  *         $ref: "#/definitions/james_domain"
  *   james_domain_status:
  *     description: Domain status
  *     schema:
  *       type: object
  *       properties:
  *         ok:
  *           type: boolean
  *         notAddedDomains:
  *           type: array
  *           items:
  *             $ref: "#/definitions/james_domain_name"
  *         notRemovedDomains:
  *           type: array
  *           items:
  *             $ref: "#/definitions/james_domain_name"
  *     examples:
  *       application/json:
  *         {
  *           "ok": false,
  *           "notAddedDomains": ["lng.com"],
  *           "notRemovedDomains": ["openpaas.org"]
  *         }
  */
