let domainLib;
let logger;

module.exports = function(dependencies) {
  domainLib = dependencies('domain');
  logger = dependencies('logger');

  return {
    ensureAliasIsValidDomain
  };
};

function ensureAliasIsValidDomain(req, res, next) {
  const aliasInParams = req.params.alias;

  domainLib.getByName(aliasInParams).then(domain => {
    if (!domain) {
      return res.status(400).json({
        error: {
          code: 400,
          message: 'Bad Request',
          details: 'alias must be an existing domain'
        }
      });
    }

    if (domain.id === req.domain.id) {
      return res.status(400).json({
        error: {
          code: 400,
          message: 'Bad Request',
          details: 'domain and alias cannot be the same'
        }
      });
    }

    next();
  })
  .catch(err => {
    const details = `Error while validating alias "${req.params.alias}"`;

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
