const q = require('q');
const { JWT_DEFAULT_SUBJECT } = require('./constants');

let authJwt;

module.exports = (dependencies) => {
  authJwt = dependencies('auth').jwt;

  return {
    generate
  };
};

function generate(user = {}) {
  const payload = {
    sub: user.preferredEmail || JWT_DEFAULT_SUBJECT,
    admin: true
  };

  return q.denodeify(authJwt.generateWebToken)(payload);
}
