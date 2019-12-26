const { expect } = require('chai');
const sinon = require('sinon');

describe('The webserver/api/quota/middleware module', function() {
  let getModule, corePlatformAdminMock;

  beforeEach(function() {
    corePlatformAdminMock = {};

    this.moduleHelpers.addDep('platformadmin', corePlatformAdminMock);

    getModule = () =>
      require(`${this.moduleHelpers.backendPath}/webserver/api/quota/middleware`)(this.moduleHelpers.dependencies);
  });

  describe('The checkAuthorization method', function() {
    describe('When scope is domain', function() {
      it('should call #next() if the requester is a platform admin', function(done) {
        const user = { id: 'userId' };

        corePlatformAdminMock.isPlatformAdmin = sinon.stub().returns(Promise.resolve(true));

        const req = {
          query: {
            scope: 'domain'
          },
          user
        };
        const res = {};
        const next = () => {
          expect(corePlatformAdminMock.isPlatformAdmin).to.have.been.calledWith(user.id);
          done();
        };

        getModule().checkAuthorization(req, res, next);
      });
    });
  });
});
