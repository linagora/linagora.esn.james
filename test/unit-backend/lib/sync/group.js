const q = require('q');
const sinon = require('sinon');
const { expect } = require('chai');
const mockery = require('mockery');

describe('The lib/sync/group module', function() {
  let getModule;
  let pubsubTopicMock, groupMock, clientMock;
  let EVENTS;

  beforeEach(function() {
    getModule = () => require(this.moduleHelpers.backendPath + '/lib/sync')(this.moduleHelpers.dependencies);
    EVENTS = require(this.moduleHelpers.backendPath + '/lib/sync/constants').EVENTS;

    pubsubTopicMock = sinon.stub().returns({ subscribe() {} });
    groupMock = {};
    clientMock = {};

    mockery.registerMock('../client', () => clientMock);
    this.moduleHelpers.addDep('pubsub', { local: { topic: pubsubTopicMock } });
    this.moduleHelpers.addDep('linagora.esn.group', { lib: { group: groupMock } });
  });

  describe('The handler of GROUP_CREATED event ', function() {
    let eventHandler;

    beforeEach(function() {
      pubsubTopicMock.withArgs(EVENTS.GROUP_CREATED).returns({
        subscribe(handler) {
          eventHandler = handler;
        }
      });
    });

    it('should create group using client', function(done) {
      const group = { email: 'group@email.com', members: [{}, {}] };
      const members = ['member1@email.com', 'member2@email.com'];

      groupMock.getAllMembers = sinon.stub().returns(q.resolve(members));
      groupMock.getMemberEmail = member => member;
      clientMock.addGroup = sinon.spy();

      getModule().init();
      eventHandler({ payload: group }).done(() => {
        expect(groupMock.getAllMembers).to.have.been.calledOnce;
        expect(groupMock.getAllMembers).to.have.been.calledWith(group);

        expect(clientMock.addGroup).to.have.been.calledOnce;
        expect(clientMock.addGroup).to.have.been.calledWith(group.email, members);

        done();
      });
    });

    it('should reject if pubsub payload is null', function(done) {
      getModule().init();
      eventHandler().catch((err) => {
        expect(err.message).to.equal('group cannot be null');
        done();
      });
    });
  });

  describe('The handler of GROUP_DELETED event ', function() {
    let eventHandler;

    beforeEach(function() {
      pubsubTopicMock.withArgs(EVENTS.GROUP_DELETED).returns({
        subscribe(handler) {
          eventHandler = handler;
        }
      });
    });

    it('should remove group using client', function(done) {
      const group = { email: 'group@email.com' };

      clientMock.removeGroup = sinon.stub().returns(q.resolve());

      getModule().init();
      eventHandler({ payload: group }).done(() => {
        expect(clientMock.removeGroup).to.have.been.calledOnce;
        expect(clientMock.removeGroup).to.have.been.calledWith(group.email);

        done();
      });
    });

    it('should reject if pubsub payload is null', function(done) {
      getModule().init();
      eventHandler().catch((err) => {
        expect(err.message).to.equal('group cannot be null');
        done();
      });
    });
  });
});
