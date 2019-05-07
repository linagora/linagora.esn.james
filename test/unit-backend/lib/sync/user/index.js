const sinon = require('sinon');
const { expect } = require('chai');
const mockery = require('mockery');

describe('The lib/sync/user module', function() {
  let getModule;
  let pubsubTopicMock, synchronizerMock;
  let EVENTS;

  beforeEach(function() {
    getModule = () => require(`${this.moduleHelpers.backendPath}/lib/sync/user`)(this.moduleHelpers.dependencies);
    EVENTS = require(`${this.moduleHelpers.backendPath}/lib/sync/constants`).EVENTS;

    pubsubTopicMock = sinon.stub().returns({ subscribe() {} });
    synchronizerMock = {};

    mockery.registerMock('./synchronizer', () => synchronizerMock);
    this.moduleHelpers.addDep('pubsub', { local: { topic: pubsubTopicMock } });
  });

  describe('The init method', function() {
    let eventHandler;

    beforeEach(function() {
      pubsubTopicMock.withArgs(EVENTS.USER_UPDATED).returns({
        subscribe(handler) {
          eventHandler = handler;
        }
      });
    });

    it('should sync user on user updated event', function(done) {
      const user = { _id: '123' };

      synchronizerMock.sync = sinon.stub().returns(Promise.resolve());

      getModule().init();
      eventHandler(user).then(() => {
        expect(synchronizerMock.sync).to.have.been.calledWith(user);

        done();
      });
    });
  });
});
