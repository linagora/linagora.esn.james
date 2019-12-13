module.exports = (dependencies) => {
  const { validator } = require('./validator')(dependencies);

  return {
    validateRules
  };

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
