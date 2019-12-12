const composableMiddleware = require('composable-middleware');
const { QUOTA_SCOPES } = require('./constants');
const { promisify } = require('util');

module.exports = dependencies => {
  const logger = dependencies('logger');
  const platformadminsMW = dependencies('platformadminsMW');
  const corePlatformAdmin = dependencies('platformadmin');
  const domainModule = dependencies('domain');
  const domainMW = dependencies('domainMW');
  const coreUserModule = dependencies('user');

  return {
    checkAuthorization,
    checkScopeIdInQuery,
    loadTargetScope,
    requireScopeQuery,
    validateQuota
  };

  function requireScopeQuery(req, res, next) {
    const { scope } = req.query;

    if (!scope) {
      return res.status(400).json({
        error: {
          code: 400,
          message: 'Bad Request',
          details: 'Query scope is required'
        }
      });
    }

    const availableScopes = Object.values(QUOTA_SCOPES);

    if (availableScopes.indexOf(scope) === -1) {
      return res.status(400).json({
        error: {
          code: 400,
          message: 'Bad Request',
          details: 'Query scope is invalid. Available scopes are: platform, domain and user'
        }
      });
    }

    next();
  }

  function checkScopeIdInQuery(req, res, next) {
    const {
      scope,
      domain_id,
      user_id
    } = req.query;

    if (scope === QUOTA_SCOPES.DOMAIN && !domain_id) {
      return res.status(400).json({
        error: {
          code: 400,
          message: 'Bad Request',
          details: 'Query domain_id is required for scope domain'
        }
      });
    }

    if (scope === QUOTA_SCOPES.USER && !domain_id) {
      return res.status(400).json({
        error: {
          code: 400,
          message: 'Bad Request',
          details: 'Query domain_id is required for scope user'
        }
      });
    }

    if (scope === QUOTA_SCOPES.USER && !user_id) {
      return res.status(400).json({
        error: {
          code: 400,
          message: 'Bad Request',
          details: 'Query user_id is required for scope user'
        }
      });
    }

    next();
  }

  function loadTargetScope(req, res, next) {
    if (req.query.scope === QUOTA_SCOPES.PLATFORM) {
      return next();
    }

    const loadMiddlewares = [domainMW.loadFromDomainIdParameter];

    if (req.query.scope === QUOTA_SCOPES.USER) {
      loadMiddlewares.push(_loadTargetUser);
    }

    return composableMiddleware(loadMiddlewares)(req, res, next);
  }

  function checkAuthorization(req, res, next) {
    if (req.query.scope === QUOTA_SCOPES.PLATFORM) {
      return platformadminsMW.requirePlatformAdmin(req, res, next);
    }

    if (req.query.scope === QUOTA_SCOPES.DOMAIN) {
      return _checkAuthorizationForDomainScope(req, res, next);
    }

    return _checkAuthorizationForUserScope(req, res, next);
  }

  function validateQuota(req, res, next) {
    const { size, count } = req.body;

    if (size === undefined || count === undefined) {
      return res.status(400).json({
        error: {
          code: 400,
          message: 'Bad Request',
          details: 'Quota size and count are required'
        }
      });
    }

    if (_isValidQuotaField(size) && _isValidQuotaField(count)) return next();

    return res.status(400).json({
      error: {
        code: 400,
        message: 'Bad Request',
        details: 'Quota size or count is invalid. Valid values are: -1, null or non-negative integers'
      }
    });
  }

  function _isValidQuotaField(value) {
    return value === -1 || value === null || (Number.isInteger(value) && value >= 0);
  }

  function _loadTargetUser(req, res, next) {
    return promisify(coreUserModule.get)(req.query.user_id)
      .then(user => {
        if (!user) {
          return res.status(404).json({
            error: {
              code: 404,
              message: 'Not Found',
              details: 'Target user is not found'
            }
          });
        }

        req.targetUser = user;

        next();
      })
      .catch(err => {
        const details = 'Error while loading target user';

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

  function _checkAuthorizationForDomainScope(req, res, next) {
    const { user, domain } = req;

    corePlatformAdmin.isPlatformAdmin(user._id)
      .then(isPlatformAdmin => {
        if (isPlatformAdmin) return next();

        return promisify(domainModule.userIsDomainAdministrator)(user, domain)
          .then(isDomainAdministrator => {
            if (!isDomainAdministrator) {
              return res.status(403).json({
                error: {
                  code: 403,
                  message: 'Forbidden',
                  details: 'The operation requires admin rights of the platform or the domain'
                }
              });
            }

            next();
          });
      })
      .catch(err => {
        const details = 'Error while checking authorization';

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

  function _checkAuthorizationForUserScope(req, res, next) {
    const { user, domain, targetUser } = req;

    return promisify(domainModule.userIsDomainAdministrator)(user, domain)
      .then(isDomainAdministrator => {
        if (!isDomainAdministrator) {
          return res.status(403).json({
            error: {
              code: 403,
              message: 'Forbidden',
              details: 'The operation requires admin rights of the domain'
            }
          });
        }

        return promisify(domainModule.userIsDomainMember)(targetUser, domain)
          .then(isDomainMember => {
            if (!isDomainMember) {
              return res.status(403).json({
                error: {
                  code: 403,
                  message: 'Forbidden',
                  details: 'Target user must be a member of the domain'
                }
              });
            }

            next();
          });
      })
      .catch(err => {
        const details = 'Error while checking authorization';

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
};
