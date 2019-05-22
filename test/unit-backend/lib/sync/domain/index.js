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

      clientMock.createDomain = sinon.spy(() => Promise.resolve());

      getModule().init();
      eventHandler({ payload: domain })
        .then(() => {
          expect(clientMock.createDomain).to.have.been.calledWith(domain.name);
          done();
        })
        .catch(err => done(err || 'should resolve'));
    });

    it('should reject if pubsub payload is null', function(done) {
      getModule().init();
      eventHandler({ payload: {} })
        .then(() => done('should not resolve'))
        .catch(err => {
          expect(err.message).to.equal('domain name cannot be null');
          done();
        });
    });
  });
});
