'use strict';

const composableMw = require('composable-middleware');

let corePlatformAdmin;
let domainMW;
let authorizationMW;
let logger;

module.exports = function(dependencies) {
  logger = dependencies('logger');
  corePlatformAdmin = dependencies('platformadmin');
  domainMW = dependencies('domainMW');
  authorizationMW = dependencies('authorizationMW');

  return {
    canGenerateToken
  };
};

function canGenerateToken(req, res, next) {
  corePlatformAdmin.isPlatformAdmin(req.user.id).then(isPlatformAdmin => {
    if (isPlatformAdmin) {
      return next();
    }

    return composableMw(
      domainMW.loadSessionDomain,
      authorizationMW.requiresDomainManager
    )(req, res, next);
  })
  .catch(err => {
    const details = 'Error while checking platformadmin';

    logger.error(details, err);

    res.status(500).json({
      error: {
        code: 500,
        message: 'Server Error',
        details
      }
    });
  });
}
