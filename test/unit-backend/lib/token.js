const { expect } = require('chai');

describe('The lib/token module', function() {
  let getModule;
  let authMock;

  beforeEach(function() {
    authMock = {};
    this.moduleHelpers.addDep('auth', authMock);
    getModule = () => require(this.moduleHelpers.backendPath + '/lib/token')(this.moduleHelpers.dependencies);
  });

  describe('The generate function', function() {
    it('should generate JWT token with correct payload', function(done) {
      const user = {
        preferredEmail: 'user@email.com'
      };

      authMock.jwt = {
        generateWebToken(payload) {
          expect(payload).to.deep.equal({ sub: user.preferredEmail, admin: true });
          done();
        }
      };

      getModule().generate(user);
    });
  });
});
