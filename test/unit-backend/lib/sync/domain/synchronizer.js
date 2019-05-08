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
    it('should resolve OK if members in Mongo and James are synchronized', function(done) {
      const esnDomains = [{ name: 'domain1' }, { name: 'domain2' }];
      const jamesDomains = ['domain1', 'domain2'];

      coreDomainMock.list = (opts, callback) => callback(null, esnDomains);
      clientMock.listDomains = () => Promise.resolve(jamesDomains);
      clientMock.listDomainMappings = () => Promise.resolve({});

      getModule().getStatus().then((status) => {
        expect(status.ok).to.equal(true);
        expect(status.notAddedDomains).to.have.length(0);
        expect(status.notRemovedDomains).to.have.length(0);
        expect(status.notAddedDomainMappings).to.have.length(0);
        expect(status.notRemovedDomainMappings).to.have.length(0);
        done();
      }).catch(done);
    });

    it('should resolve NOK if domains in ESN and James are not synchronized', function(done) {
      const esnDomains = [
        { name: 'domain1', hostnames: ['ok1'] },
        { name: 'domain2', hostnames: ['ok2', 'not-added2'] },
        { name: 'domain3', hostnames: [] }
      ];
      const jamesDomains = ['domain1', 'domain2', 'domain5'];
      const jamesDomainMappings = {
        domain1: ['ok1'],
        domain2: ['ok2'],
        domain3: ['not-removed3']
      };

      coreDomainMock.list = (opts, callback) => callback(null, esnDomains);
      clientMock.listDomains = () => Promise.resolve(jamesDomains);
      clientMock.listDomainMappings = () => Promise.resolve(jamesDomainMappings);

      getModule().getStatus().then((status) => {
        expect(status.ok).to.equal(false);
        expect(status.notAddedDomains).to.deep.equal(['domain3']);
        expect(status.notRemovedDomains).to.deep.equal(['domain5']);
        expect(status.notAddedDomainMappings).to.deep.equal([
          { source: 'domain2', aliases: ['not-added2'] }
        ]);
        expect(status.notRemovedDomainMappings).to.deep.equal([
          {source: 'domain3', aliases: ['not-removed3']}
        ]);
        done();
      }).catch(done);
    });
  });

  describe('The sync function', function() {
    it('should create missing James domain and domain aliases comparing to ESN domains', function(done) {
      const esnDomains = [
        { name: 'domain1', hostnames: ['ok1'] },
        { name: 'domain2', hostnames: ['ok2', 'not-added2'] },
        { name: 'domain3', hostnames: [] },
        { name: 'domain4'}
      ];
      const jamesDomains = ['domain1', 'domain2', 'domain5'];
      const jamesDomainMappings = {
        domain1: ['ok1'],
        domain2: ['ok2'],
        domain3: ['not-removed3']
      };

      coreDomainMock.list = (opts, callback) => callback(null, esnDomains);
      clientMock.listDomains = () => Promise.resolve(jamesDomains);
      clientMock.listDomainMappings = () => Promise.resolve(jamesDomainMappings);
      clientMock.createDomain = sinon.stub().returns(Promise.resolve());
      clientMock.removeDomain = sinon.stub().returns(Promise.resolve());
      clientMock.addDomainAliases = sinon.stub().returns(Promise.resolve());
      clientMock.removeDomainAliases = sinon.stub().returns(Promise.resolve());

      getModule().sync().then(() => {
        expect(clientMock.createDomain).to.have.been.calledTwice;
        expect(clientMock.createDomain).to.have.been.calledWith('domain3');
        expect(clientMock.createDomain).to.have.been.calledWith('domain4');

        expect(clientMock.removeDomain).to.have.been.calledOnce;
        expect(clientMock.removeDomain).to.have.been.calledWith('domain5');

        expect(clientMock.addDomainAliases).to.have.been.calledOnce;
        expect(clientMock.addDomainAliases).to.have.been.calledWith('domain2', ['not-added2']);

        expect(clientMock.removeDomainAliases).to.have.been.calledOnce;
        expect(clientMock.removeDomainAliases).to.have.been.calledWith('domain3', ['not-removed3']);
        done();
      }).catch(done);
    });
  });

  describe('The getDomainAliasesStatus function', () => {
    it('should resolve OK if domain hostnames in OpenPaaS and domain aliases in James are synchronized', function(done) {
      const esnDomain = { name: 'domain', hostnames: ['domain1', 'domain2']};
      const jamesDomainAliases = ['domain1', 'domain2'];

      clientMock.listDomainAliases = () => Promise.resolve(jamesDomainAliases);

      getModule().getDomainAliasesStatus(esnDomain).then((status) => {
        expect(status.ok).to.equal(true);
        expect(status.notAddedAliases).to.have.length(0);
        expect(status.notRemovedAliases).to.have.length(0);
        done();
      }).catch(done);
    });

    it('should resolve NOK if domain hostnames in OpenPaaS and domain aliases in James are not synchronized', function(done) {
      const esnDomain = { name: 'domain', hostnames: ['domain2', 'domain3']};
      const jamesDomainAliases = ['domain1', 'domain2'];

      clientMock.listDomainAliases = () => Promise.resolve(jamesDomainAliases);

      getModule().getDomainAliasesStatus(esnDomain).then((status) => {
        expect(status.ok).to.equal(false);
        expect(status.notAddedAliases).to.deep.equal(['domain3']);
        expect(status.notRemovedAliases).to.deep.equal(['domain1']);
        done();
      }).catch(done);
    });
  });

  describe('The syncDomainAliases function', () => {
    it('should create missing domain aliases and remove redundant domain aliases', function(done) {
      const esnDomain = { name: 'domain', hostnames: ['domain2', 'domain3']};
      const jamesDomainAliases = ['domain1', 'domain2'];

      clientMock.listDomainAliases = () => Promise.resolve(jamesDomainAliases);
      clientMock.addDomainAliases = sinon.stub().returns(Promise.resolve());
      clientMock.removeDomainAliases = sinon.stub().returns(Promise.resolve());

      getModule().syncDomainAliases(esnDomain).then(() => {
        expect(clientMock.addDomainAliases).to.have.been.calledOnce;
        expect(clientMock.addDomainAliases).to.have.been.calledWith(esnDomain.name, ['domain3']);

        expect(clientMock.removeDomainAliases).to.have.been.calledOnce;
        expect(clientMock.removeDomainAliases).to.have.been.calledWith(esnDomain.name, ['domain1']);

        done();
      }).catch(done);
    });
  });
});
