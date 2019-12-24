module.exports = (dependencies, lib) => {
  const logger = dependencies('logger');
  const client = lib.client;
  const { validator } = require('./validator')(dependencies);

  return {
    loadRule,
    validateRules
  };

  function loadRule(req, res, next) {
    const domainName = req.domain.name;
    const ruleId = req.params.ruleId;

    client.getDlpRule(domainName, ruleId)
      .then(rule => {
        req.rule = rule;

        next();
      })
      .catch(err => {
        if (err.response && err.response.status === 404) {
          const details = `There is no rule "${ruleId}" on "${domainName}"`;

          return res.status(404).json({
            error: {
              code: 404,
              message: 'Not Found',
              details
            }
          });
        }

        const details = `Error while getting DLP rule id "${ruleId}" for domain "${domainName}"`;

        logger.error(details, err);

        return res.status(500).json({
          error: {
            code: 500,
            message: 'Server Error',
            details
          }
        });
      });
  }

  function validateRules(req, res, next) {
    const rules = req.body;
    const uniqueIds = [...new Set(rules.map(rule => rule.id))];

    if (uniqueIds.length < rules.length) {
      return res.status(400).json({
        error: {
          code: 400,
          message: 'Bad Request',
          details: 'Id duplicates are not allowed in DLP rules'
        }
      });
    }

    const invalidRules = validator(rules);

    if (invalidRules) {
      return res.status(400).json({
        error: {
          code: 400,
          message: 'Bad Request',
          details: invalidRules
        }
      });
    }

    next();
  }
};
