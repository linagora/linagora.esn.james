'use strict';

let logger;
let authJwt;

module.exports = function(dependencies) {
  logger = dependencies('logger');
  authJwt = dependencies('auth').jwt;

  return {
    generateJwtToken
  };
};

function generateJwtToken(req, res) {
  const user = req.user;
  const payload = {
    sub: user.preferredEmail,
    admin: true
  };

  authJwt.generateWebToken(payload, (err, token) => {
    if (err || !token) {
      logger.error('Error while generating JWT token for administrator', err);

      return res.status(500).json({
        error: {
          code: 500,
          message: 'Server Error',
          details: 'Error while generating JWT token for administrator'
        }
      });
    }

    return res.status(200).json(token);
  });
}
