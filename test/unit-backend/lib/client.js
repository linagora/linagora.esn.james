const sinon = require('sinon');
const { expect } = require('chai');
const q = require('q');
const mockery = require('mockery');

describe('The lib/client module', function() {
  let getModule;
  let tokenMock, esnConfigGetMock, JamesClientMock;

  beforeEach(function() {
    getModule = () => require(this.moduleHelpers.backendPath + '/lib/client')(this.moduleHelpers.dependencies);

    tokenMock = { generate: () => q.resolve() };
    esnConfigGetMock = () => q.resolve();
    JamesClientMock = function() {};

    mockery.registerMock('./token', () => tokenMock);
    mockery.registerMock('james-admin-client', { Client: JamesClientMock });
    this.moduleHelpers.addDep('esn-config', () => ({ get: esnConfigGetMock }));
  });

  describe('The addGroupMembers function', function() {
    it('should fail if it cannot get API URL', function(done) {
      const group = 'group@email.com';
      const members = ['member1@email.com', 'member2@email.com'];

      esnConfigGetMock = () => q.reject(new Error('an_error'));

      getModule().addGroupMembers(group, members).catch(err => {
        expect(err.message).to.equal('an_error');
        done();
      });
    });

    it('should fail if it cannot generate JWT token', function(done) {
      const group = 'group@email.com';
      const members = ['member1@email.com', 'member2@email.com'];

      tokenMock.generate = () => q.reject(new Error('an_error'));

      getModule().addGroupMembers(group, members).catch(err => {
        expect(err.message).to.equal('an_error');
        done();
      });
    });

    it('should add all group members one by one', function(done) {
      const group = 'group@email.com';
      const members = ['member1@email.com', 'member2@email.com'];

      JamesClientMock.prototype.addGroupMember = sinon.stub().returns(q.resolve());

      getModule().addGroupMembers(group, members).then(() => {
        expect(JamesClientMock.prototype.addGroupMember).to.have.been.calledTwice;
        expect(JamesClientMock.prototype.addGroupMember).to.have.been.calledWith(group, members[0]);
        expect(JamesClientMock.prototype.addGroupMember).to.have.been.calledWith(group, members[1]);
        done();
      });
    });
  });

  describe('The removeGroup function', function() {
    it('should fail if it cannot get API URL', function(done) {
      const group = 'group@email.com';

      esnConfigGetMock = () => q.reject(new Error('an_error'));

      getModule().removeGroup(group).catch(err => {
        expect(err.message).to.equal('an_error');
        done();
      });
    });

    it('should fail if it cannot generate JWT token', function(done) {
      const group = 'group@email.com';

      tokenMock.generate = () => q.reject(new Error('an_error'));

      getModule().removeGroup(group).catch(err => {
        expect(err.message).to.equal('an_error');
        done();
      });
    });

    it('should list all members and remove them all', function(done) {
      const group = 'group@email.com';
      const members = ['member1@email.com', 'member2@email.com'];

      JamesClientMock.prototype.listGroupMembers = sinon.stub().returns(q.resolve(members));
      JamesClientMock.prototype.removeGroupMember = sinon.stub().returns(q.resolve());

      getModule().removeGroup(group).then(() => {
        expect(JamesClientMock.prototype.listGroupMembers).to.have.been.calledOnce;
        expect(JamesClientMock.prototype.listGroupMembers).to.have.been.calledWith(group);

        expect(JamesClientMock.prototype.removeGroupMember).to.have.been.calledTwice;
        expect(JamesClientMock.prototype.removeGroupMember).to.have.been.calledWith(group, members[0]);
        expect(JamesClientMock.prototype.removeGroupMember).to.have.been.calledWith(group, members[1]);
        done();
      });
    });
  });

  describe('The removeGroupMembers function', function() {
    it('should fail if it cannot get API URL', function(done) {
      const group = 'group@email.com';
      const members = ['member1@email.com', 'member2@email.com'];

      esnConfigGetMock = () => q.reject(new Error('an_error'));

      getModule().removeGroupMembers(group, members).catch(err => {
        expect(err.message).to.equal('an_error');
        done();
      });
    });

    it('should fail if it cannot generate JWT token', function(done) {
      const group = 'group@email.com';
      const members = ['member1@email.com', 'member2@email.com'];

      tokenMock.generate = () => q.reject(new Error('an_error'));

      getModule().removeGroupMembers(group, members).catch(err => {
        expect(err.message).to.equal('an_error');
        done();
      });
    });

    it('should remove group members one by one', function(done) {
      const group = 'group@email.com';
      const members = ['member1@email.com', 'member2@email.com'];

      JamesClientMock.prototype.removeGroupMember = sinon.stub().returns(q.resolve());

      getModule().removeGroupMembers(group, members).then(() => {
        expect(JamesClientMock.prototype.removeGroupMember).to.have.been.calledTwice;
        expect(JamesClientMock.prototype.removeGroupMember).to.have.been.calledWith(group, members[0]);
        expect(JamesClientMock.prototype.removeGroupMember).to.have.been.calledWith(group, members[1]);
        done();
      });
    });
  });

  describe('The updateGroup function', function() {
    it('should fail if old and new group are the same', function(done) {
      const oldGroup = 'old@group.com';
      const newGroup = 'old@group.com';

      getModule().updateGroup(oldGroup, newGroup).catch(err => {
        expect(err.message).to.equal('nothing to update');
        done();
      });
    });

    it('should fail if it cannot get API URL', function(done) {
      const oldGroup = 'old@group.com';
      const newGroup = 'new@group.com';

      esnConfigGetMock = () => q.reject(new Error('an_error'));

      getModule().updateGroup(oldGroup, newGroup).catch(err => {
        expect(err.message).to.equal('an_error');
        done();
      });
    });

    it('should fail if it cannot generate JWT token', function(done) {
      const oldGroup = 'old@group.com';
      const newGroup = 'new@group.com';

      tokenMock.generate = () => q.reject(new Error('an_error'));

      getModule().updateGroup(oldGroup, newGroup).catch(err => {
        expect(err.message).to.equal('an_error');
        done();
      });
    });

    it('should move all members from old group to the new one', function(done) {
      const oldGroup = 'old@group.com';
      const newGroup = 'new@group.com';
      const members = ['member1@email.com', 'member2@email.com'];

      JamesClientMock.prototype.listGroupMembers = sinon.stub().returns(q.resolve(members));
      JamesClientMock.prototype.addGroupMember = sinon.stub().returns(q.resolve());
      JamesClientMock.prototype.removeGroupMember = sinon.stub().returns(q.resolve());

      getModule().updateGroup(oldGroup, newGroup).then(() => {
        expect(JamesClientMock.prototype.removeGroupMember).to.have.been.calledTwice;
        expect(JamesClientMock.prototype.removeGroupMember).to.have.been.calledWith(oldGroup, members[0]);
        expect(JamesClientMock.prototype.removeGroupMember).to.have.been.calledWith(oldGroup, members[1]);

        expect(JamesClientMock.prototype.addGroupMember).to.have.been.calledTwice;
        expect(JamesClientMock.prototype.addGroupMember).to.have.been.calledWith(newGroup, members[0]);
        expect(JamesClientMock.prototype.addGroupMember).to.have.been.calledWith(newGroup, members[1]);
        done();
      });
    });
  });
});
