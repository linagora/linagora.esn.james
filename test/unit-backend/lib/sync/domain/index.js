const q = require('q');
const sinon = require('sinon');
const { expect } = require('chai');
const mockery = require('mockery');

describe('The lib/sync/domain module', function() {
  let getModule;
  let pubsubTopicMock, clientMock;
  let EVENTS;

  beforeEach(function() {
    getModule = () => require(this.moduleHelpers.backendPath + '/lib/sync/domain')(this.moduleHelpers.dependencies);
    EVENTS = require(this.moduleHelpers.backendPath + '/lib/sync/constants').EVENTS;

    pubsubTopicMock = sinon.stub().returns({ subscribe() {} });
    clientMock = {};

    mockery.registerMock('../../client', () => clientMock);
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
});
