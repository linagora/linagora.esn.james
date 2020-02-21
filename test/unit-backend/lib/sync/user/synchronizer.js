const { expect } = require('chai');
const sinon = require('sinon');
const mockery = require('mockery');

describe('The lib/sync/user/synchronizer module', function() {
  let getModule;
  let clientMock;

  beforeEach(function() {
    getModule = () => require(`${this.moduleHelpers.backendPath}/lib/sync/user/synchronizer`)(this.moduleHelpers.dependencies);

    clientMock = {};

    mockery.registerMock('../../client', () => clientMock);
  });

  describe('The sync method', function() {
    it('should create missing user aliases and remove redundant user aliases', function(done) {
      const user = {
        accounts: [{
          type: 'email',
          emails: ['user1@open-paas.org', 'alias1@open-paas.org', 'alias2@open-paas.org']
        }],
        preferredEmail: 'user1@open-paas.org'
      };
      const jamesAliases = [{ source: 'alias3@open-paas.org' }];

      clientMock.listUserAliases = () => Promise.resolve(jamesAliases);
      clientMock.addUserAliases = sinon.spy();
      clientMock.removeUserAliases = sinon.spy();

      getModule().sync(user).then(() => {
        expect(clientMock.addUserAliases).to.have.been.calledOnce;
        expect(clientMock.addUserAliases).to.have.been.calledWith(user.preferredEmail, ['alias1@open-paas.org', 'alias2@open-paas.org']);

        expect(clientMock.removeUserAliases).to.have.been.calledOnce;
        expect(clientMock.removeUserAliases).to.have.been.calledWith(user.preferredEmail, ['alias3@open-paas.org']);

        done();
      }).catch(done);
    });
  });
});
