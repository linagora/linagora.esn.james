const q = require('q');
const sinon = require('sinon');
const { expect } = require('chai');
const mockery = require('mockery');

describe('The lib/sync/group module', function() {
  let groupModuleMock, clientMock, handlerMock;

  beforeEach(function() {
    groupModuleMock = {
      registry: {
        register: (name, handler) => {
          handlerMock = handler;
        }
      },
      group: {}
    };
    clientMock = {};

    mockery.registerMock('../../client', () => clientMock);
    this.moduleHelpers.addDep('linagora.esn.group', { lib: groupModuleMock });

    require(`${this.moduleHelpers.backendPath}/lib/sync/group`)(this.moduleHelpers.dependencies).init();
  });

  describe('The createGroup function', function() {
    it('should create group using client', function(done) {
      const group = { email: 'group@email.com', members: [{}, {}] };
      const members = ['member1@email.com', 'member2@email.com'];

      groupModuleMock.group.getAllMembers = sinon.stub().returns(q.resolve(members));
      groupModuleMock.group.getMemberEmail = member => member;
      clientMock.addGroup = sinon.spy();

      handlerMock.createGroup(group)
        .then(() => {
          expect(groupModuleMock.group.getAllMembers).to.have.been.calledOnce;
          expect(groupModuleMock.group.getAllMembers).to.have.been.calledWith(group);
          expect(clientMock.addGroup).to.have.been.calledOnce;
          expect(clientMock.addGroup).to.have.been.calledWith(group.email, members);
          done();
        })
        .catch(err => done(err || 'should resolve'));
    });

    it('should reject if there is no group', function(done) {
      handlerMock.createGroup().catch(err => {
        expect(err.message).to.equal('group cannot be null');
        done();
      });
    });
  });

  describe('The updateGroup function', function() {
    it('should reject if there is no group', function(done) {
      handlerMock.updateGroup().catch(err => {
        expect(err.message).to.equal('both old and new group are required');
        done();
      });
    });

    it('should reject if old group is missing', function(done) {
      const group = { email: 'group@email.com' };

      handlerMock.updateGroup(group).catch((err) => {
        expect(err.message).to.equal('both old and new group are required');
        done();
      });
    });

    it('should reject if new group is missing', function(done) {
      const group = { email: 'group@email.com' };

      handlerMock.updateGroup(null, group).catch((err) => {
        expect(err.message).to.equal('both old and new group are required');
        done();
      });
    });

    it('should update group using client', function(done) {
      const oldGroup = { email: 'old@group.com' };
      const newGroup = { email: 'new@group.com' };

      clientMock.updateGroup = sinon.stub().returns(q.resolve());

      handlerMock.updateGroup(oldGroup, newGroup)
        .then(() => {
          expect(clientMock.updateGroup).to.have.been.calledOnce;
          expect(clientMock.updateGroup).to.have.been.calledWith(oldGroup.email, newGroup.email);
          done();
        })
        .catch(err => done(err || 'should resolve'));
    });

    it('should do nothing and resolve if old and new group have the same email', function(done) {
      const oldGroup = { email: 'old@group.com' };
      const newGroup = { email: 'old@group.com' };

      clientMock.updateGroup = sinon.stub().returns(q.resolve());

      handlerMock.updateGroup(oldGroup, newGroup)
        .then(() => {
          expect(clientMock.updateGroup).to.not.have.been.called;
          done();
        })
        .catch(err => done(err || 'should resolve'));
    });
  });

  describe('The deleteGroup function', function() {
    it('should remove group using client', function(done) {
      const group = { email: 'group@email.com' };

      clientMock.removeGroup = sinon.stub().returns(q.resolve());

      handlerMock.deleteGroup(group)
        .then(() => {
          expect(clientMock.removeGroup).to.have.been.calledOnce;
          expect(clientMock.removeGroup).to.have.been.calledWith(group.email);

          done();
        })
        .catch(err => done(err || 'should resolve'));
    });

    it('should reject if there is no group', function(done) {
      handlerMock.deleteGroup().catch(err => {
        expect(err.message).to.equal('group cannot be null');
        done();
      });
    });
  });

  describe('The addGroupMembers function', function() {
    it('should add members to group using client', function(done) {
      const group = { email: 'group@email.com' };
      const members = ['member1@email.com', 'member2@email.com'];

      clientMock.addGroupMembers = sinon.stub().returns(q.resolve());
      groupModuleMock.group.resolveMember = sinon.stub().returns(q.resolve());
      groupModuleMock.group.getMemberEmail = sinon.stub();
      groupModuleMock.group.getMemberEmail.onCall(0).returns(members[0]);
      groupModuleMock.group.getMemberEmail.onCall(1).returns(members[1]);

      handlerMock.addGroupMembers(group, members)
        .then(() => {
          expect(groupModuleMock.group.resolveMember).to.have.been.calledTwice;
          expect(groupModuleMock.group.getMemberEmail).to.have.been.calledTwice;

          expect(clientMock.addGroupMembers).to.have.been.calledOnce;
          expect(clientMock.addGroupMembers).to.have.been.calledWith(group.email, members);

          done();
        })
        .catch(err => done(err || 'should resolve'));
    });
  });

  describe('The removeGroupMembers function ', function() {
    it('should remove members from group using client', function(done) {
      const group = { email: 'group@email.com' };
      const members = ['member1@email.com', 'member2@email.com'];

      clientMock.removeGroupMembers = sinon.stub().returns(q.resolve());
      groupModuleMock.group.resolveMember = sinon.stub().returns(q.resolve());
      groupModuleMock.group.getMemberEmail = sinon.stub();
      groupModuleMock.group.getMemberEmail.onCall(0).returns(members[0]);
      groupModuleMock.group.getMemberEmail.onCall(1).returns(members[1]);

      handlerMock.removeGroupMembers(group, members)
        .then(() => {
          expect(groupModuleMock.group.resolveMember).to.have.been.calledTwice;
          expect(groupModuleMock.group.getMemberEmail).to.have.been.calledTwice;

          expect(clientMock.removeGroupMembers).to.have.been.calledOnce;
          expect(clientMock.removeGroupMembers).to.have.been.calledWith(group.email, members);

          done();
        })
        .catch(err => done(err || 'should resolve'));
    });
  });
});
