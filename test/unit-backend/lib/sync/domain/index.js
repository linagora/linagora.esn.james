const q = require('q');
const sinon = require('sinon');
const { expect } = require('chai');
const mockery = require('mockery');

describe('The lib/sync/domain module', function() {
  let getModule;
  let pubsubTopicMock, clientMock, synchronizerMock;
  let EVENTS;

  beforeEach(function() {
    getModule = () => require(this.moduleHelpers.backendPath + '/lib/sync/domain')(this.moduleHelpers.dependencies);
    EVENTS = require(this.moduleHelpers.backendPath + '/lib/sync/constants').EVENTS;

    pubsubTopicMock = sinon.stub().returns({ subscribe() {} });
    clientMock = {};
    synchronizerMock = {};

    mockery.registerMock('../../client', () => clientMock);
    mockery.registerMock('./synchronizer', () => synchronizerMock);
    this.moduleHelpers.addDep('pubsub', { local: { topic: pubsubTopicMock } });
  });

  describe('The handler of DOMAIN_CREATED event', function() {
    let eventHandler;

    beforeEach(function() {
      pubsubTopicMock.withArgs(EVENTS.DOMAIN_CREATED).returns({
        subscribe(handler) {
          eventHandler = handler;
        }
      });
    });

    it('should create domain using client', function(done) {
      const domain = { name: 'mydomain' };

      clientMock.createDomain = sinon.spy(function() {
        return q.when();
      });

      getModule().init();
      eventHandler({ payload: domain }).done(() => {
        expect(clientMock.createDomain).to.have.been.calledWith(domain.name);

        done();
      });
    });

    it('should create domain aliases after successfully creating james domain', function(done) {
      const domain = { name: 'mydomain', hostnames: ['hostname1', 'hostname2'] };

      clientMock.createDomain = sinon.stub().returns(Promise.resolve());
      clientMock.addDomainAliases = sinon.stub().returns(Promise.resolve());

      getModule().init();
      eventHandler({ payload: domain }).then(() => {
        expect(clientMock.createDomain).to.have.been.calledWith(domain.name);
        expect(clientMock.addDomainAliases).to.have.been.calledWith(domain.name, domain.hostnames);

        done();
      }).catch(done);
    });

    it('should not create domain aliases when there is no hostnames', function(done) {
      const domain = { name: 'mydomain' };

      clientMock.createDomain = () => Promise.resolve();
      clientMock.addDomainAliases = sinon.spy();

      getModule().init();
      eventHandler({ payload: domain }).then(() => {
        expect(clientMock.addDomainAliases).to.not.have.been.called;
        done();
      }).catch(done);
    });

    it('should not create domain aliases when hostnames is empty', function(done) {
      const domain = { name: 'mydomain', hostname: [] };

      clientMock.createDomain = () => Promise.resolve();
      clientMock.addDomainAliases = sinon.spy();

      getModule().init();
      eventHandler({ payload: domain }).then(() => {
        expect(clientMock.addDomainAliases).to.not.have.been.called;
        done();
      }).catch(done);
    });

    it('should reject if pubsub payload is null', function(done) {
      getModule().init();
      eventHandler({ payload: {}}).catch((err) => {
        expect(err.message).to.equal('domain name cannot be null');
        done();
      });
    });
  });

  describe('The handler of DOMAIN_UPDATED event', () => {
    let eventHandler;

    beforeEach(function() {
      pubsubTopicMock.withArgs(EVENTS.DOMAIN_UPDATED).returns({
        subscribe(handler) {
          eventHandler = handler;
        }
      });
    });

    it('should create domain when domain is not created then synchronize domain aliases', function(done) {
      const domain = { name: 'mydomain' };

      clientMock.isDomainCreated = () => Promise.resolve(false);
      clientMock.createDomain = sinon.stub().returns(Promise.resolve());
      synchronizerMock.syncDomainAliases = sinon.stub().returns(Promise.resolve());

      getModule().init();
      eventHandler({ payload: domain }).then(() => {
        expect(clientMock.createDomain).to.have.been.calledWith(domain.name);
        expect(synchronizerMock.syncDomainAliases).to.have.been.calledWith(domain);
        done();
      }).catch(done);
    });

    it('should synchronize domain aliases when domain is created', function(done) {
      const domain = { name: 'mydomain' };

      clientMock.isDomainCreated = () => Promise.resolve(true);
      clientMock.createDomain = sinon.spy(function() {
        done(new Error('should not call createDomain'));
      });
      synchronizerMock.syncDomainAliases = sinon.stub().returns(Promise.resolve());

      getModule().init();
      eventHandler({ payload: domain }).then(() => {
        expect(clientMock.createDomain).to.not.have.been.called;
        expect(synchronizerMock.syncDomainAliases).to.have.been.calledWith(domain);
        done();
      }).catch(done);
    });

    it('should reject when domain does not contain a name', function(done) {
      getModule().init();
      eventHandler({ payload: {}})
        .then(() => done(new Error('should not resolve')))
        .catch((err) => {
          expect(err.message).to.equal('domain name cannot be null');
          done();
        });
    });
  });
});
