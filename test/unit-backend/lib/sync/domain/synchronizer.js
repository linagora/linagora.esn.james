const { expect } = require('chai');
const sinon = require('sinon');
const mockery = require('mockery');

describe('The lib/sync/group/synchronizer module', function() {
  let getModule;
  let coreDomainMock, clientMock;

  beforeEach(function() {
    getModule = () => require(this.moduleHelpers.backendPath + '/lib/sync/domain/synchronizer')(this.moduleHelpers.dependencies);

    clientMock = {};
    coreDomainMock = {};

    mockery.registerMock('../../client', () => clientMock);
    this.moduleHelpers.addDep('domain', coreDomainMock);
  });

  describe('The getStatus function', function() {
    it('should resolve OK if members in ESN and James are synchronized', function(done) {
      const esnDomains = [{ name: 'domain1' }, { name: 'domain2' }];
      const jamesDomains = ['domain1', 'domain2'];

      coreDomainMock.list = (opts, callback) => callback(null, esnDomains);
      clientMock.listDomains = () => Promise.resolve(jamesDomains);

      getModule().getStatus().then((status) => {
        expect(status.ok).to.equal(true);
        expect(status.notAddedDomains).to.have.length(0);
        expect(status.notRemovedDomains).to.have.length(0);
        done();
      }).catch(done);
    });

    it('should resolve NOK if domains in ESN and James are not synchronized', function(done) {
      const esnDomains = [{ name: 'domain1' }, { name: 'domain2' }, { name: 'domain3' }];
      const jamesDomains = ['domain1', 'domain2', 'domain5'];

      coreDomainMock.list = (opts, callback) => callback(null, esnDomains);
      clientMock.listDomains = () => Promise.resolve(jamesDomains);

      getModule().getStatus().then((status) => {
        expect(status.ok).to.equal(false);
        expect(status.notAddedDomains).to.deep.equal(['domain3']);
        expect(status.notRemovedDomains).to.deep.equal(['domain5']);
        done();
      }).catch(done);
    });
  });

  describe('The sync function', function() {
    it('should create missing James domain comparing to ESN domains', function(done) {
      const esnDomains = [{ name: 'domain1' }, { name: 'domain2' }, { name: 'domain3' }];
      const jamesDomains = ['domain1', 'domain4'];

      coreDomainMock.list = (opts, callback) => callback(null, esnDomains);
      clientMock.listDomains = () => Promise.resolve(jamesDomains);
      clientMock.createDomain = sinon.stub().returns(Promise.resolve());
      clientMock.removeDomain = sinon.stub().returns(Promise.resolve());

      getModule().sync().then(() => {
        expect(clientMock.createDomain).to.have.been.calledTwice;
        expect(clientMock.createDomain).to.have.been.calledWith('domain2');
        expect(clientMock.createDomain).to.have.been.calledWith('domain3');

        expect(clientMock.removeDomain).to.have.been.calledOnce;
        expect(clientMock.removeDomain).to.have.been.calledWith('domain4');

        done();
      }).catch(done);
    });
  });
});
