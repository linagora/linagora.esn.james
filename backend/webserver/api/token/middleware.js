'use strict';

const composableMw = require('composable-middleware');

let platformadminsMW;
let domainMW;
let authorizationMW;

module.exports = function(dependencies) {
  platformadminsMW = dependencies('platformadminsMW');
  domainMW = dependencies('domainMW');
  authorizationMW = dependencies('authorizationMW');

  return {
    canGenerateToken
  };
};

function canGenerateToken(req, res, next) {
  if (req.query.domain_id) {
    composableMw(
      domainMW.loadFromDomainIdParameter,
      authorizationMW.requiresDomainManager
    )(req, res, next);
  } else {
    platformadminsMW.requirePlatformAdmin(req, res, next);
  }
}
