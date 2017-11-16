const q = require('q');
const { expect } = require('chai');
const sinon = require('sinon');
const mockery = require('mockery');

describe('The lib/sync/group/synchronizer module', function() {
  let getModule;
  let groupMock, clientMock;
  let group;

  beforeEach(function() {
    getModule = () => require(this.moduleHelpers.backendPath + '/lib/sync/group/synchronizer')(this.moduleHelpers.dependencies);

    group = { _id: 'groupId', email: 'group@email'};
    groupMock = {
      getAllMembers: () => q.resolve([]),
      getMemberEmail: (member) => member.email
    };
    clientMock = {
      getGroupMembers: () => q.resolve([])
    };

    mockery.registerMock('../../client', () => clientMock);
    this.moduleHelpers.addDep('linagora.esn.group', { lib: { group: groupMock } });
  });

  describe('The getStatus function', function() {
    it('should fail if it cannot get group members from MongoDB', function(done) {
      groupMock.getAllMembers = () => q.reject(new Error('an_error'));

      getModule().getStatus(group).catch((err) => {
        expect(err.message).to.equal('an_error');
        done();
      });
    });

    it('should fail if it cannot get group members from James', function(done) {
      clientMock.getGroupMembers = () => q.reject(new Error('an_error'));

      getModule().getStatus(group).catch((err) => {
        expect(err.message).to.equal('an_error');
        done();
      });
    });

    it('should resolve OK if members in Mongo and James are synchronized', function(done) {
      const membersInMongo = [{ email: 'm1@email' }, { email: 'm2@email' }];
      const membersInJames = ['m1@email', 'm2@email'];

      groupMock.getAllMembers = () => q.resolve(membersInMongo);
      clientMock.getGroupMembers = () => q.resolve(membersInJames);

      getModule().getStatus(group).then((status) => {
        expect(status.ok).to.equal(true);
        expect(status.notRemovedMembers).to.have.length(0);
        expect(status.notAddedMembers).to.have.length(0);
        done();
      });
    });

    it('should resolve NOK if members in Mongo and James are not synchronized', function(done) {
      const membersInMongo = [{ email: 'm1@email' }, { email: 'm2@email' }];
      const membersInJames = ['m1@email', 'm3@email'];

      groupMock.getAllMembers = () => q.resolve(membersInMongo);
      clientMock.getGroupMembers = () => q.resolve(membersInJames);

      getModule().getStatus(group).then((status) => {
        expect(status.ok).to.equal(false);
        expect(status.notRemovedMembers).to.deep.equal([membersInJames[1]]);
        expect(status.notAddedMembers).to.deep.equal([membersInMongo[1].email]);
        done();
      });
    });
  });

  describe('The sync function', function() {
    it('should add and remove group members in James to synchronize with group members in MongoDB', function(done) {
      const membersInMongo = [{ email: 'm1@email' }, { email: 'm2@email' }];
      const membersInJames = ['m1@email', 'm3@email'];

      groupMock.getAllMembers = () => q.resolve(membersInMongo);
      clientMock.getGroupMembers = () => q.resolve(membersInJames);
      clientMock.addGroupMembers = sinon.stub().returns(q.resolve());
      clientMock.removeGroupMembers = sinon.stub().returns(q.resolve());

      getModule().sync(group).then(() => {
        expect(clientMock.addGroupMembers).to.have.been.calledOnce;
        expect(clientMock.addGroupMembers).to.have.been.calledWith(group.email, [membersInMongo[1].email]);

        expect(clientMock.removeGroupMembers).to.have.been.calledOnce;
        expect(clientMock.removeGroupMembers).to.have.been.calledWith(group.email, [membersInJames[1]]);

        done();
      });
    });
  });
});
