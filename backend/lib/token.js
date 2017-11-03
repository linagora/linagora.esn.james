const q = require('q');

let authJwt;

module.exports = (dependencies) => {
  authJwt = dependencies('auth').jwt;

  return {
    generate
  };
};

function generate(user = {}) {
  const payload = {
    sub: user.preferredEmail,
    admin: true
  };

  return q.denodeify(authJwt.generateWebToken)(payload);
}
