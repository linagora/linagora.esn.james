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
    mockery.registerMock('@linagora/james-admin-client', { Client: JamesClientMock });
    this.moduleHelpers.addDep('esn-config', () => ({
      inModule() {
        return { get: esnConfigGetMock };
      }
    }));
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

  describe('The getGroupMembers function', function() {
    it('should fail if it cannot get API URL', function(done) {
      const group = 'group@email.com';

      esnConfigGetMock = () => q.reject(new Error('an_error'));

      getModule().getGroupMembers(group).catch(err => {
        expect(err.message).to.equal('an_error');
        done();
      });
    });

    it('should fail if it cannot generate JWT token', function(done) {
      const group = 'group@email.com';

      tokenMock.generate = () => q.reject(new Error('an_error'));

      getModule().getGroupMembers(group).catch(err => {
        expect(err.message).to.equal('an_error');
        done();
      });
    });

    it('should resolve empty array on client error', function(done) {
      const group = 'group@email.com';

      JamesClientMock.prototype.listGroupMembers = sinon.stub().returns(q.reject(new Error('an_error')));

      getModule().getGroupMembers(group).then((members) => {
        expect(JamesClientMock.prototype.listGroupMembers).to.have.been.calledOnce;
        expect(JamesClientMock.prototype.listGroupMembers).to.have.been.calledWith(group);
        expect(members).to.have.length(0);
        done();
      });
    });

    it('should resolve array of members on success', function(done) {
      const group = 'group@email.com';
      const members = ['member1@email.com', 'member2@email.com'];

      JamesClientMock.prototype.listGroupMembers = sinon.stub().returns(q.resolve(members));

      getModule().getGroupMembers(group).then((members) => {
        expect(JamesClientMock.prototype.listGroupMembers).to.have.been.calledOnce;
        expect(JamesClientMock.prototype.listGroupMembers).to.have.been.calledWith(group);
        expect(members).to.have.length(2);
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

  describe('The addDomainAliases function', function() {
    it('should fail if it cannot get API URL', function(done) {
      esnConfigGetMock = () => Promise.reject(new Error('an_error'));

      getModule().addDomainAliases('domain1', [])
        .then(() => done(new Error('should not resolve')))
        .catch(err => {
          expect(err.message).to.equal('an_error');
          done();
        });
    });

    it('should fail if it cannot generate JWT token', function(done) {
      tokenMock.generate = () => q.reject(new Error('an_error'));

      getModule().addDomainAliases('domain1', [])
        .then(() => done(new Error('should not resolve')))
        .catch(err => {
          expect(err.message).to.equal('an_error');
          done();
      });
    });

    it('should resolve after successfully added domain aliases', function(done) {
      const domain = { name: 'domain1', hostnames: ['hostname1', 'hostname2'] };

      JamesClientMock.prototype.addDomainAlias = sinon.stub().returns(Promise.resolve());

      getModule().addDomainAliases(domain.name, domain.hostnames).then(() => {
        expect(JamesClientMock.prototype.addDomainAlias).to.have.been.calledTwice;
        expect(JamesClientMock.prototype.addDomainAlias).to.have.been.calledWith(domain.name, domain.hostnames[0]);
        expect(JamesClientMock.prototype.addDomainAlias).to.have.been.calledWith(domain.name, domain.hostnames[1]);
        done();
      }).catch(done);
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

  describe('The addDestinationsToForward function', function() {
    let forward, destinations;

    beforeEach(() => {
      forward = 'user0@email.com';
      destinations = ['user1@email.com', 'user2@email.com'];
    });

    it('should fail if it cannot get API URL', done => {
      esnConfigGetMock = () => q.reject(new Error('an_error'));

      getModule().addDestinationsToForward(forward, destinations).catch(err => {
        expect(err.message).to.equal('an_error');
        done();
      });
    });

    it('should fail if it cannot generate JWT token', done => {
      tokenMock.generate = () => q.reject(new Error('an_error'));

      getModule().addDestinationsToForward(forward, destinations).catch(err => {
        expect(err.message).to.equal('an_error');
        done();
      });
    });

    it('should add all destinations one by one', done => {
      JamesClientMock.prototype.forward = {
        addDestination: sinon.stub().returns(q.resolve())
      };

      getModule().addDestinationsToForward(forward, destinations).then(() => {
        expect(JamesClientMock.prototype.forward.addDestination).to.have.been.calledTwice;
        expect(JamesClientMock.prototype.forward.addDestination).to.have.been.calledWith(forward, destinations[0]);
        expect(JamesClientMock.prototype.forward.addDestination).to.have.been.calledWith(forward, destinations[1]);
        done();
      });
    });
  });

  describe('The removeDestinationsOfForward function', function() {
    let forward, destinations;

    beforeEach(() => {
      forward = 'user0@email.com';
      destinations = ['user1@email.com', 'user2@email.com'];
    });

    it('should fail if it cannot get API URL', function(done) {
      esnConfigGetMock = () => q.reject(new Error('an_error'));

      getModule().removeDestinationsOfForward(forward, destinations).catch(err => {
        expect(err.message).to.equal('an_error');
        done();
      });
    });

    it('should fail if it cannot generate JWT token', function(done) {
      tokenMock.generate = () => q.reject(new Error('an_error'));

      getModule().removeDestinationsOfForward(forward, destinations).catch(err => {
        expect(err.message).to.equal('an_error');
        done();
      });
    });

    it('should remove destinations one by one', function(done) {
      JamesClientMock.prototype.forward = {
        removeDestination: sinon.stub().returns(q.resolve())
      };

      getModule().removeDestinationsOfForward(forward, destinations).then(() => {
        expect(JamesClientMock.prototype.forward.removeDestination).to.have.been.calledTwice;
        expect(JamesClientMock.prototype.forward.removeDestination).to.have.been.calledWith(forward, destinations[0]);
        expect(JamesClientMock.prototype.forward.removeDestination).to.have.been.calledWith(forward, destinations[1]);
        done();
      });
    });
  });

  describe('The removeForward function', function() {
    const forward = 'user0@email.com';

    it('should fail if it cannot get API URL', function(done) {
      esnConfigGetMock = () => q.reject(new Error('an_error'));

      getModule().removeForward(forward).catch(err => {
        expect(err.message).to.equal('an_error');
        done();
      });
    });

    it('should fail if it cannot generate JWT token', function(done) {
      tokenMock.generate = () => q.reject(new Error('an_error'));

      getModule().removeForward(forward).catch(err => {
        expect(err.message).to.equal('an_error');
        done();
      });
    });

    it('should remove all destinations of forward', function(done) {
      const dest1 = 'user1@email.com';
      const dest2 = 'user2@email.com';
      const destinations = [
        { mailAddress: dest1 },
        { mailAddress: dest2 }
      ];

      JamesClientMock.prototype.forward = {
        listDestinationsOfForward: sinon.stub().returns(Promise.resolve(destinations)),
        removeDestination: sinon.stub().returns(Promise.resolve())
      };

      getModule().removeForward(forward).then(() => {
        expect(JamesClientMock.prototype.forward.listDestinationsOfForward).to.have.been.calledWith(forward);
        expect(JamesClientMock.prototype.forward.removeDestination).to.have.been.calledWith(forward, dest1);
        expect(JamesClientMock.prototype.forward.removeDestination).to.have.been.calledWith(forward, dest2);
        done();
      });
    });
  });

  describe('The removeLocalCopyOfForward function', function() {
    const forward = 'user0@email.com';

    it('should fail if it cannot get API URL', function(done) {
      esnConfigGetMock = () => q.reject(new Error('an_error'));

      getModule().removeLocalCopyOfForward(forward).catch(err => {
        expect(err.message).to.equal('an_error');
        done();
      });
    });

    it('should fail if it cannot generate JWT token', function(done) {
      tokenMock.generate = () => q.reject(new Error('an_error'));

      getModule().removeLocalCopyOfForward(forward).catch(err => {
        expect(err.message).to.equal('an_error');
        done();
      });
    });

    it('should remove local copy of forward', function(done) {
      JamesClientMock.prototype.forward = {
        removeDestination: sinon.stub().returns(Promise.resolve())
      };

      getModule().removeLocalCopyOfForward(forward).then(() => {
        expect(JamesClientMock.prototype.forward.removeDestination).to.have.been.calledWith(forward, forward);
        done();
      });
    });
  });

  describe('The listDestinationsOfForward function', function() {
    it('should fail if it cannot get API URL', function(done) {
      esnConfigGetMock = () => q.reject(new Error('an_error'));

      getModule().listDestinationsOfForward('user0@email.com').catch(err => {
        expect(err.message).to.equal('an_error');
        done();
      });
    });

    it('should fail if it cannot generate JWT token', function(done) {
      tokenMock.generate = () => q.reject(new Error('an_error'));

      getModule().listDestinationsOfForward('user0@email.com').catch(err => {
        expect(err.message).to.equal('an_error');
        done();
      });
    });

    it('should return an empty array if get 404 error from client', function(done) {
      const forward = 'user0@email.com';

      JamesClientMock.prototype.forward = {
        listDestinationsOfForward: sinon.stub().returns(q.reject({ response: { status: 404 } }))
      };

      getModule().listDestinationsOfForward(forward).then(destinations => {
        expect(JamesClientMock.prototype.forward.listDestinationsOfForward).to.have.been.calledOnce;
        expect(JamesClientMock.prototype.forward.listDestinationsOfForward).to.have.been.calledWith(forward);
        expect(destinations).to.have.lengthOf(0);
        done();
      });
    });

    it('should return an array of destinations if success', function(done) {
      const forward = 'user0@email.com';
      const dest1 = 'user1@email.com';
      const dest2 = 'user2@email.com';
      const destinations = [
        { mailAddress: dest1 },
        { mailAddress: dest2 }
      ];

      JamesClientMock.prototype.forward = {
        listDestinationsOfForward: sinon.stub().returns(q.resolve(destinations))
      };

      getModule().listDestinationsOfForward(forward).then(destinations => {
        expect(JamesClientMock.prototype.forward.listDestinationsOfForward).to.have.been.calledOnce;
        expect(JamesClientMock.prototype.forward.listDestinationsOfForward).to.have.been.calledWith(forward);
        expect(destinations).to.deep.equal([dest1, dest2]);
        done();
      });
    });
  });

  describe('The listForwardsInDomain function', function() {
    it('should fail if it cannot get API URL', function(done) {
      esnConfigGetMock = () => q.reject(new Error('an_error'));

      getModule().listForwardsInDomain('domain-name').catch(err => {
        expect(err.message).to.equal('an_error');
        done();
      });
    });

    it('should fail if it cannot generate JWT token', function(done) {
      tokenMock.generate = () => q.reject(new Error('an_error'));

      getModule().listForwardsInDomain('domain-name').catch(err => {
        expect(err.message).to.equal('an_error');
        done();
      });
    });

    it('should return an array of forwards in domain if success', function(done) {
      const forward0 = 'user0@domain1.com';
      const forward1 = 'user1@domain1.com';
      const forward2 = 'user2@domain2.com';

      JamesClientMock.prototype.forward = {
        list: sinon.stub().returns(Promise.resolve([forward0, forward1, forward2]))
      };

      getModule().listForwardsInDomain('domain1.com').then(forwards => {
        expect(JamesClientMock.prototype.forward.list).to.have.been.called;
        expect(forwards).to.deep.equal([forward0, forward1]);
        done();
      });
    });
  });

  describe('The listDomainAliases function', () => {
    it('should fail if it cannot get API URL', function(done) {
      esnConfigGetMock = () => Promise.reject(new Error('an_error'));

      getModule().listDomainAliases('domain-name')
        .then(() => done(new Error('should not resolve')))
        .catch(err => {
          expect(err.message).to.equal('an_error');
          done();
        });
    });

    it('should fail if it cannot generate JWT token', function(done) {
      tokenMock.generate = () => Promise.reject(new Error('an_error'));

      getModule().listDomainAliases('domain-name')
        .then(() => done(new Error('should not resolve')))
        .catch(err => {
          expect(err.message).to.equal('an_error');
          done();
        });
    });

    it('should resolve with the list of domain aliases', function(done) {
      JamesClientMock.prototype.listDomainAliases = sinon.stub().returns(Promise.resolve(['alias1.domain1.com']));

      getModule().listDomainAliases('domain1.com').then(aliases => {
        expect(JamesClientMock.prototype.listDomainAliases).to.have.been.calledWith('domain1.com');
        expect(aliases).to.deep.equal(['alias1.domain1.com']);
        done();
      }).catch(done);
    });

    it('should resolve with an empty array if response from james is mappings not found', function(done) {
      JamesClientMock.prototype.listDomainAliases = sinon.stub().returns(Promise.reject({
        response: {
          data: { message: 'Cannot find mappings for domain1.com'}
        }
      }));

      getModule().listDomainAliases('domain1.com').then(aliases => {
        expect(JamesClientMock.prototype.listDomainAliases).to.have.been.calledWith('domain1.com');
        expect(aliases).to.be.empty;
        done();
      }).catch(done);
    });
  });

  describe('The listUsersHavingAliases method', function() {
    it('should fail if it cannot get API URL', function(done) {
      esnConfigGetMock = () => q.reject(new Error('an_error'));

      getModule().listUsersHavingAliases('domain-name')
        .then(() => done('should not resolve'))
        .catch(err => {
          expect(err.message).to.equal('an_error');
          done();
        });
    });

    it('should fail if it cannot generate JWT token', function(done) {
      tokenMock.generate = () => q.reject(new Error('an_error'));

      getModule().listUsersHavingAliases('domain-name')
        .then(() => done('should not resolve'))
        .catch(err => {
          expect(err.message).to.equal('an_error');
          done();
        });
    });

    it('should return an array of users who have alias if success', function(done) {
      const users = ['user1@domain.com', 'user2@domain.com'];

      JamesClientMock.prototype.listUsersHavingAliases = sinon.stub().returns(Promise.resolve(users));

      getModule().listUsersHavingAliases()
        .then(_users => {
          expect(JamesClientMock.prototype.listUsersHavingAliases).to.have.been.called;
          expect(_users).to.deep.equal(users);
          done();
        })
        .catch(err => done(err || 'should resolve'));
    });
  });

  describe('The listUserAliases method', function() {
    it('should fail if it cannot get API URL', function(done) {
      esnConfigGetMock = () => q.reject(new Error('an_error'));

      getModule().listUserAliases('domain-name')
        .then(() => done('should not resolve'))
        .catch(err => {
          expect(err.message).to.equal('an_error');
          done();
        });
    });

    it('should fail if it cannot generate JWT token', function(done) {
      tokenMock.generate = () => q.reject(new Error('an_error'));

      getModule().listUserAliases('domain-name')
        .then(() => done('should not resolve'))
        .catch(err => {
          expect(err.message).to.equal('an_error');
          done();
        });
    });

    it('should return an array of aliases of the user if success', function(done) {
      const user = 'user@domain.com';
      const aliases = ['alias1@domain.com', 'alias2@domain.com'];

      JamesClientMock.prototype.listUserAliases = sinon.stub().returns(Promise.resolve(aliases));

      getModule().listUserAliases(user).then(_aliases => {
        expect(JamesClientMock.prototype.listUserAliases).to.have.been.calledWith(user);
        expect(_aliases).to.deep.equal(aliases);
        done();
      })
      .catch(err => done(err || 'should resolve'));
    });
  });

  describe('The addUserAlias method', function() {
    it('should fail if it cannot get API URL', function(done) {
      esnConfigGetMock = () => q.reject(new Error('an_error'));

      getModule().addUserAlias('domain-name')
        .then(() => done('should not resolve'))
        .catch(err => {
          expect(err.message).to.equal('an_error');
          done();
        });
    });

    it('should fail if it cannot generate JWT token', function(done) {
      tokenMock.generate = () => q.reject(new Error('an_error'));

      getModule().addUserAlias('domain-name')
        .then(() => done('should not resolve'))
        .catch(err => {
          expect(err.message).to.equal('an_error');
          done();
        });
    });

    it('should resolve if success to add alias', function(done) {
      const user = 'user@domain.com';
      const alias = 'alias@domain.com';

      JamesClientMock.prototype.addUserAlias = sinon.stub().returns(Promise.resolve());

      getModule().addUserAlias(user, alias).then(() => {
        expect(JamesClientMock.prototype.addUserAlias).to.have.been.calledWith(user, alias);
        done();
      })
      .catch(err => done(err || 'should resolve'));
    });
  });

  describe('The addUserAliases method', function() {
    it('should fail if it cannot get API URL', function(done) {
      esnConfigGetMock = () => q.reject(new Error('an_error'));

      getModule().addUserAliases('domain-name')
        .then(() => done('should not resolve'))
        .catch(err => {
          expect(err.message).to.equal('an_error');
          done();
        });
    });

    it('should fail if it cannot generate JWT token', function(done) {
      tokenMock.generate = () => q.reject(new Error('an_error'));

      getModule().addUserAliases('domain-name')
        .then(() => done('should not resolve'))
        .catch(err => {
          expect(err.message).to.equal('an_error');
          done();
        });
    });

    it('should resolve if success to add alias', function(done) {
      const user = 'user@domain.com';
      const aliases = ['alias1@domain.com', 'alias2@domain.com'];

      JamesClientMock.prototype.addUserAlias = sinon.stub().returns(Promise.resolve());

      getModule().addUserAliases(user, aliases).then(() => {
        expect(JamesClientMock.prototype.addUserAlias).to.have.been.calledTwice;
        expect(JamesClientMock.prototype.addUserAlias).to.have.been.calledWith(user, aliases[0]);
        expect(JamesClientMock.prototype.addUserAlias).to.have.been.calledWith(user, aliases[1]);
        done();
      })
      .catch(err => done(err || 'should resolve'));
    });
  });

  describe('The removeUserAlias method', function() {
    it('should fail if it cannot get API URL', function(done) {
      esnConfigGetMock = () => q.reject(new Error('an_error'));

      getModule().removeUserAlias('domain-name')
        .then(() => done('should not resolve'))
        .catch(err => {
          expect(err.message).to.equal('an_error');
          done();
        });
    });

    it('should fail if it cannot generate JWT token', function(done) {
      tokenMock.generate = () => q.reject(new Error('an_error'));

      getModule().removeUserAlias('domain-name')
        .then(() => done('should not resolve'))
        .catch(err => {
          expect(err.message).to.equal('an_error');
          done();
        });
    });

    it('should resolve if success to remove alias', function(done) {
      const user = 'user@domain.com';
      const alias = 'alias@domain.com';

      JamesClientMock.prototype.removeUserAlias = sinon.stub().returns(Promise.resolve());

      getModule().removeUserAlias(user, alias).then(() => {
        expect(JamesClientMock.prototype.removeUserAlias).to.have.been.calledWith(user, alias);
        done();
      })
      .catch(err => done(err || 'should resolve'));
    });
  });

  describe('The removeUserAliases method', function() {
    it('should fail if it cannot get API URL', function(done) {
      esnConfigGetMock = () => q.reject(new Error('an_error'));

      getModule().removeUserAliases('domain-name')
        .then(() => done('should not resolve'))
        .catch(err => {
          expect(err.message).to.equal('an_error');
          done();
        });
    });

    it('should fail if it cannot generate JWT token', function(done) {
      tokenMock.generate = () => q.reject(new Error('an_error'));

      getModule().removeUserAliases('domain-name')
        .then(() => done('should not resolve'))
        .catch(err => {
          expect(err.message).to.equal('an_error');
          done();
        });
    });

    it('should resolve if success to remove alias', function(done) {
      const user = 'user@domain.com';
      const aliases = ['alias1@domain.com', 'alias2@domain.com'];

      JamesClientMock.prototype.removeUserAlias = sinon.stub().returns(Promise.resolve());

      getModule().removeUserAliases(user, aliases).then(() => {
        expect(JamesClientMock.prototype.removeUserAlias).to.have.been.calledTwice;
        expect(JamesClientMock.prototype.removeUserAlias).to.have.been.calledWith(user, aliases[0]);
        expect(JamesClientMock.prototype.removeUserAlias).to.have.been.calledWith(user, aliases[1]);
        done();
      })
      .catch(err => done(err || 'should resolve'));
    });
  });

  describe('The restoreDeletedMessages function', () => {
    it('should fail if it cannot get API URL', function(done) {
      esnConfigGetMock = () => q.reject(new Error('an_error'));

      getModule().restoreDeletedMessages()
        .then(() => done(new Error('should not have resolved')))
        .catch(err => {
          expect(err.message).to.equal('an_error');
          done();
        });
    });

    it('should fail if it cannot generate JWT token', function(done) {
      tokenMock.generate = () => q.reject(new Error('an_error'));

      getModule().restoreDeletedMessages()
        .then(() => done(new Error('should not have resolved')))
        .catch(err => {
          expect(err.message).to.equal('an_error');
          done();
        });
    });

    it('should resolve with task id of restoring process', function(done) {
      JamesClientMock.prototype.restoreDeletedMessages = sinon.stub().returns(Promise.resolve({
        taskId: '767c7da2-a13a-40a5-9504-4e9bce50130d'
      }));

      getModule().restoreDeletedMessages('admin@open-paas.org', {
        combinator: 'and',
        criteria: [
          {
            fieldName: 'subject',
            operator: 'containsIgnoreCase',
            value: 'Apache James'
          }
        ]
      }).then(aliases => {
        expect(JamesClientMock.prototype.restoreDeletedMessages).to.have.been.called;
        expect(aliases).to.be.deep.equal({
          taskId: '767c7da2-a13a-40a5-9504-4e9bce50130d'
        });

        done();
      }).catch(done);
    });
  });

  describe('The exportDeletedMessages function', () => {
    it('should fail if it cannot get API URL', function(done) {
      esnConfigGetMock = () => q.reject(new Error('an_error'));

      getModule().exportDeletedMessages()
        .then(() => done(new Error('should not have resolved')))
        .catch(err => {
          expect(err.message).to.equal('an_error');
          done();
        });
    });

    it('should fail if it cannot generate JWT token', function(done) {
      tokenMock.generate = () => q.reject(new Error('an_error'));

      getModule().exportDeletedMessages()
        .then(() => done(new Error('should not have resolved')))
        .catch(err => {
          expect(err.message).to.equal('an_error');
          done();
        });
    });

    it('should resolve with task id of exporting process', function(done) {
      JamesClientMock.prototype.exportDeletedMessages = sinon.stub().returns(Promise.resolve({
        taskId: '767c7da2-a13a-40a5-9504-4e9bce50130d'
      }));

      getModule().exportDeletedMessages('admin@open-paas.org', 'receiver@gmail.com', {
        combinator: 'and',
        criteria: [
          {
            fieldName: 'subject',
            operator: 'containsIgnoreCase',
            value: 'Apache James'
          }
        ]
      }).then(aliases => {
        expect(JamesClientMock.prototype.exportDeletedMessages).to.have.been.called;
        expect(aliases).to.be.deep.equal({
          taskId: '767c7da2-a13a-40a5-9504-4e9bce50130d'
        });

        done();
      }).catch(done);
    });
  });

  describe('The getPlatformQuota method', function() {
    it('should fail if it cannot get API URL', function(done) {
      esnConfigGetMock = () => Promise.reject(new Error('something wrong'));

      getModule().getPlatformQuota()
        .then(() => done(new Error('should not resolve')))
        .catch(err => {
          expect(err.message).to.equal('something wrong');
          done();
        });
    });

    it('should fail if it cannot generate JWT token', function(done) {
      tokenMock.generate = () => Promise.reject(new Error('something wrong'));

      getModule().getPlatformQuota()
        .then(() => done(new Error('should not resolve')))
        .catch(err => {
          expect(err.message).to.equal('something wrong');
          done();
        });
    });

    it('should reject if failed to get platform quota', function(done) {
      JamesClientMock.prototype.getQuota = sinon.stub().returns(Promise.reject(new Error('something wrong')));

      getModule().getPlatformQuota()
        .then(() => done(new Error('should not resolve')))
        .catch(err => {
          expect(JamesClientMock.prototype.getQuota).to.have.been.calledOnce;
          expect(err.message).to.equal('something wrong');
          done();
        });
    });

    it('should resolve if success to get platform quota', function(done) {
      JamesClientMock.prototype.getQuota = sinon.stub().returns(Promise.resolve());

      getModule().getPlatformQuota().then(() => {
        expect(JamesClientMock.prototype.getQuota).to.have.been.calledOnce;
        done();
      })
      .catch(err => done(err || new Error('should resolve')));
    });
  });

  describe('The setPlatformQuota method', function() {
    let quota;

    beforeEach(function() {
      quota = { count: 100, size: 100 };
    });

    it('should fail if it cannot get API URL', function(done) {
      esnConfigGetMock = () => Promise.reject(new Error('something wrong'));

      getModule().setPlatformQuota(quota)
        .then(() => done(new Error('should not resolve')))
        .catch(err => {
          expect(err.message).to.equal('something wrong');
          done();
        });
    });

    it('should fail if it cannot generate JWT token', function(done) {
      tokenMock.generate = () => Promise.reject(new Error('something wrong'));

      getModule().setPlatformQuota(quota)
        .then(() => done(new Error('should not resolve')))
        .catch(err => {
          expect(err.message).to.equal('something wrong');
          done();
        });
    });

    it('should set platform quota if size is null and count is not null', function(done) {
      quota.size = null;
      JamesClientMock.prototype.deleteQuotaSize = sinon.stub().returns(Promise.resolve());
      JamesClientMock.prototype.deleteQuotaCount = sinon.stub().returns(Promise.resolve());
      JamesClientMock.prototype.setQuota = sinon.stub().returns(Promise.resolve());

      getModule().setPlatformQuota(quota)
        .then(() => {
          expect(JamesClientMock.prototype.deleteQuotaSize).to.have.been.calledOnce;
          expect(JamesClientMock.prototype.deleteQuotaCount).to.not.have.been.called;
          expect(JamesClientMock.prototype.setQuota).to.have.been.calledWith(quota);
          done();
        })
        .catch(err => done(err || new Error('should resolve')));
    });

    it('should set platform quota if size is not null and count is null', function(done) {
      quota.count = null;
      JamesClientMock.prototype.deleteQuotaCount = sinon.stub().returns(Promise.resolve());
      JamesClientMock.prototype.deleteQuotaSize = sinon.stub().returns(Promise.resolve());
      JamesClientMock.prototype.setQuota = sinon.stub().returns(Promise.resolve());

      getModule().setPlatformQuota(quota)
        .then(() => {
          expect(JamesClientMock.prototype.deleteQuotaSize).to.not.have.been.called;
          expect(JamesClientMock.prototype.deleteQuotaCount).to.have.been.calledOnce;
          expect(JamesClientMock.prototype.setQuota).to.have.been.calledWith(quota);
          done();
        })
        .catch(err => done(err || new Error('should resolve')));
    });

    it('should set platform quota if both size and count are null', function(done) {
      quota.size = null;
      quota.count = null;
      JamesClientMock.prototype.deleteQuotaCount = sinon.stub().returns(Promise.resolve());
      JamesClientMock.prototype.deleteQuotaSize = sinon.stub().returns(Promise.resolve());
      JamesClientMock.prototype.setQuota = sinon.stub().returns(Promise.resolve());

      getModule().setPlatformQuota(quota)
        .then(() => {
          expect(JamesClientMock.prototype.deleteQuotaSize).to.have.been.calledOnce;
          expect(JamesClientMock.prototype.deleteQuotaCount).to.have.been.calledOnce;
          expect(JamesClientMock.prototype.setQuota).to.not.have.been.called;
          done();
        })
        .catch(err => done(err || new Error('should resolve')));
    });

    it('should set platform quota if both size and count are not null', function(done) {
      JamesClientMock.prototype.deleteQuotaCount = sinon.stub().returns(Promise.resolve());
      JamesClientMock.prototype.deleteQuotaSize = sinon.stub().returns(Promise.resolve());
      JamesClientMock.prototype.setQuota = sinon.stub().returns(Promise.resolve());

      getModule().setPlatformQuota(quota)
        .then(() => {
          expect(JamesClientMock.prototype.deleteQuotaSize).to.not.have.been.calledOnce;
          expect(JamesClientMock.prototype.deleteQuotaCount).to.not.have.been.calledOnce;
          expect(JamesClientMock.prototype.setQuota).to.have.been.calledWith(quota);
          done();
        })
        .catch(err => done(err || new Error('should resolve')));
    });
  });

  describe('The getDomainQuota method', function() {
    const domainName = 'domainName';

    it('should fail if it cannot get API URL', function(done) {
      esnConfigGetMock = () => Promise.reject(new Error('something wrong'));

      getModule().getDomainQuota(domainName)
        .then(() => done(new Error('should not resolve')))
        .catch(err => {
          expect(err.message).to.equal('something wrong');
          done();
        });
    });

    it('should fail if it cannot generate JWT token', function(done) {
      tokenMock.generate = () => Promise.reject(new Error('something wrong'));

      getModule().getDomainQuota(domainName)
        .then(() => done(new Error('should not resolve')))
        .catch(err => {
          expect(err.message).to.equal('something wrong');
          done();
        });
    });

    it('should reject if failed to get platform quota', function(done) {
      JamesClientMock.prototype.getDomainQuota = sinon.stub().returns(Promise.reject(new Error('something wrong')));

      getModule().getDomainQuota(domainName)
        .then(() => done(new Error('should not resolve')))
        .catch(err => {
          expect(JamesClientMock.prototype.getDomainQuota).to.have.been.calledWith(domainName);
          expect(err.message).to.equal('something wrong');
          done();
        });
    });

    it('should resolve if success to get platform quota', function(done) {
      JamesClientMock.prototype.getDomainQuota = sinon.stub().returns(Promise.resolve());

      getModule().getDomainQuota(domainName).then(() => {
        expect(JamesClientMock.prototype.getDomainQuota).to.have.been.calledWith(domainName);
        done();
      })
      .catch(err => done(err || new Error('should resolve')));
    });
  });

  describe('The setDomainQuota method', function() {
    let quota;
    const domainName = 'domainName';

    beforeEach(function() {
      quota = { count: 100, size: 100 };
    });

    it('should fail if it cannot get API URL', function(done) {
      esnConfigGetMock = () => Promise.reject(new Error('something wrong'));

      getModule().setDomainQuota(domainName, quota)
        .then(() => done(new Error('should not resolve')))
        .catch(err => {
          expect(err.message).to.equal('something wrong');
          done();
        });
    });

    it('should fail if it cannot generate JWT token', function(done) {
      tokenMock.generate = () => Promise.reject(new Error('something wrong'));

      getModule().setDomainQuota(domainName, quota)
        .then(() => done(new Error('should not resolve')))
        .catch(err => {
          expect(err.message).to.equal('something wrong');
          done();
        });
    });

    it('should set domain quota if size is null and count is not null', function(done) {
      quota.size = null;
      JamesClientMock.prototype.deleteDomainQuotaSize = sinon.stub().returns(Promise.resolve());
      JamesClientMock.prototype.deleteDomainQuotaCount = sinon.stub().returns(Promise.resolve());
      JamesClientMock.prototype.setDomainQuota = sinon.stub().returns(Promise.resolve());

      getModule().setDomainQuota(domainName, quota)
        .then(() => {
          expect(JamesClientMock.prototype.deleteDomainQuotaSize).to.have.been.calledOnce;
          expect(JamesClientMock.prototype.deleteDomainQuotaCount).to.not.have.been.called;
          expect(JamesClientMock.prototype.setDomainQuota).to.have.been.calledWith(domainName, quota);
          done();
        })
        .catch(err => done(err || new Error('should resolve')));
    });

    it('should set domain quota if size is not null and count is null', function(done) {
      quota.count = null;
      JamesClientMock.prototype.deleteDomainQuotaCount = sinon.stub().returns(Promise.resolve());
      JamesClientMock.prototype.deleteDomainQuotaSize = sinon.stub().returns(Promise.resolve());
      JamesClientMock.prototype.setDomainQuota = sinon.stub().returns(Promise.resolve());

      getModule().setDomainQuota(domainName, quota)
        .then(() => {
          expect(JamesClientMock.prototype.deleteDomainQuotaSize).to.not.have.been.called;
          expect(JamesClientMock.prototype.deleteDomainQuotaCount).to.have.been.calledOnce;
          expect(JamesClientMock.prototype.setDomainQuota).to.have.been.calledWith(domainName, quota);
          done();
        })
        .catch(err => done(err || new Error('should resolve')));
    });

    it('should set domain quota if both size and count are null', function(done) {
      quota.size = null;
      quota.count = null;
      JamesClientMock.prototype.deleteDomainQuotaCount = sinon.stub().returns(Promise.resolve());
      JamesClientMock.prototype.deleteDomainQuotaSize = sinon.stub().returns(Promise.resolve());
      JamesClientMock.prototype.setDomainQuota = sinon.stub().returns(Promise.resolve());

      getModule().setDomainQuota(domainName, quota)
        .then(() => {
          expect(JamesClientMock.prototype.deleteDomainQuotaSize).to.have.been.calledOnce;
          expect(JamesClientMock.prototype.deleteDomainQuotaCount).to.have.been.calledOnce;
          expect(JamesClientMock.prototype.setDomainQuota).to.not.have.been.called;
          done();
        })
        .catch(err => done(err || new Error('should resolve')));
    });

    it('should set domain quota if both size and count are not null', function(done) {
      JamesClientMock.prototype.deleteDomainQuotaCount = sinon.stub().returns(Promise.resolve());
      JamesClientMock.prototype.deleteDomainQuotaSize = sinon.stub().returns(Promise.resolve());
      JamesClientMock.prototype.setDomainQuota = sinon.stub().returns(Promise.resolve());

      getModule().setDomainQuota(domainName, quota)
        .then(() => {
          expect(JamesClientMock.prototype.deleteDomainQuotaSize).to.not.have.been.calledOnce;
          expect(JamesClientMock.prototype.deleteDomainQuotaCount).to.not.have.been.calledOnce;
          expect(JamesClientMock.prototype.setDomainQuota).to.have.been.calledWith(domainName, quota);
          done();
        })
        .catch(err => done(err || new Error('should resolve')));
    });
  });

  describe('The getUserQuota method', function() {
    const username = 'username';

    it('should fail if it cannot get API URL', function(done) {
      esnConfigGetMock = () => Promise.reject(new Error('something wrong'));

      getModule().getUserQuota(username)
        .then(() => done(new Error('should not resolve')))
        .catch(err => {
          expect(err.message).to.equal('something wrong');
          done();
        });
    });

    it('should fail if it cannot generate JWT token', function(done) {
      tokenMock.generate = () => Promise.reject(new Error('something wrong'));

      getModule().getUserQuota(username)
        .then(() => done(new Error('should not resolve')))
        .catch(err => {
          expect(err.message).to.equal('something wrong');
          done();
        });
    });

    it('should reject if failed to get platform quota', function(done) {
      JamesClientMock.prototype.getUserQuota = sinon.stub().returns(Promise.reject(new Error('something wrong')));

      getModule().getUserQuota(username)
        .then(() => done(new Error('should not resolve')))
        .catch(err => {
          expect(JamesClientMock.prototype.getUserQuota).to.have.been.calledWith(username);
          expect(err.message).to.equal('something wrong');
          done();
        });
    });

    it('should resolve if success to get platform quota', function(done) {
      JamesClientMock.prototype.getUserQuota = sinon.stub().returns(Promise.resolve());

      getModule().getUserQuota(username).then(() => {
        expect(JamesClientMock.prototype.getUserQuota).to.have.been.calledWith(username);
        done();
      })
      .catch(err => done(err || new Error('should resolve')));
    });
  });

  describe('The setUserQuota method', function() {
    let quota;
    const username = 'username';

    beforeEach(function() {
      quota = { count: 100, size: 100 };
    });

    it('should fail if it cannot get API URL', function(done) {
      esnConfigGetMock = () => Promise.reject(new Error('something wrong'));

      getModule().setUserQuota(username, quota)
        .then(() => done(new Error('should not resolve')))
        .catch(err => {
          expect(err.message).to.equal('something wrong');
          done();
        });
    });

    it('should fail if it cannot generate JWT token', function(done) {
      tokenMock.generate = () => Promise.reject(new Error('something wrong'));

      getModule().setUserQuota(username, quota)
        .then(() => done(new Error('should not resolve')))
        .catch(err => {
          expect(err.message).to.equal('something wrong');
          done();
        });
    });

    it('should set user quota if size is null and count is not null', function(done) {
      quota.size = null;
      JamesClientMock.prototype.deleteUserQuotaSize = sinon.stub().returns(Promise.resolve());
      JamesClientMock.prototype.deleteUserQuotaCount = sinon.stub().returns(Promise.resolve());
      JamesClientMock.prototype.setUserQuota = sinon.stub().returns(Promise.resolve());

      getModule().setUserQuota(username, quota)
        .then(() => {
          expect(JamesClientMock.prototype.deleteUserQuotaSize).to.have.been.calledOnce;
          expect(JamesClientMock.prototype.deleteUserQuotaCount).to.not.have.been.called;
          expect(JamesClientMock.prototype.setUserQuota).to.have.been.calledWith(username, quota);
          done();
        })
        .catch(err => done(err || new Error('should resolve')));
    });

    it('should set user quota if size is not null and count is null', function(done) {
      quota.count = null;
      JamesClientMock.prototype.deleteUserQuotaCount = sinon.stub().returns(Promise.resolve());
      JamesClientMock.prototype.deleteUserQuotaSize = sinon.stub().returns(Promise.resolve());
      JamesClientMock.prototype.setUserQuota = sinon.stub().returns(Promise.resolve());

      getModule().setUserQuota(username, quota)
        .then(() => {
          expect(JamesClientMock.prototype.deleteUserQuotaSize).to.not.have.been.called;
          expect(JamesClientMock.prototype.deleteUserQuotaCount).to.have.been.calledOnce;
          expect(JamesClientMock.prototype.setUserQuota).to.have.been.calledWith(username, quota);
          done();
        })
        .catch(err => done(err || new Error('should resolve')));
    });

    it('should set user quota if both size and count are null', function(done) {
      quota.size = null;
      quota.count = null;
      JamesClientMock.prototype.deleteUserQuotaCount = sinon.stub().returns(Promise.resolve());
      JamesClientMock.prototype.deleteUserQuotaSize = sinon.stub().returns(Promise.resolve());
      JamesClientMock.prototype.setUserQuota = sinon.stub().returns(Promise.resolve());

      getModule().setUserQuota(username, quota)
        .then(() => {
          expect(JamesClientMock.prototype.deleteUserQuotaSize).to.have.been.calledOnce;
          expect(JamesClientMock.prototype.deleteUserQuotaCount).to.have.been.calledOnce;
          expect(JamesClientMock.prototype.setUserQuota).to.not.have.been.called;
          done();
        })
        .catch(err => done(err || new Error('should resolve')));
    });

    it('should set user quota if both size and count are not null', function(done) {
      JamesClientMock.prototype.deleteUserQuotaCount = sinon.stub().returns(Promise.resolve());
      JamesClientMock.prototype.deleteUserQuotaSize = sinon.stub().returns(Promise.resolve());
      JamesClientMock.prototype.setUserQuota = sinon.stub().returns(Promise.resolve());

      getModule().setUserQuota(username, quota)
        .then(() => {
          expect(JamesClientMock.prototype.deleteUserQuotaSize).to.not.have.been.calledOnce;
          expect(JamesClientMock.prototype.deleteUserQuotaCount).to.not.have.been.calledOnce;
          expect(JamesClientMock.prototype.setUserQuota).to.have.been.calledWith(username, quota);
          done();
        })
        .catch(err => done(err || new Error('should resolve')));
    });
  });

  describe('The getDlpRule function', function() {
    it('should fail if it cannot get API URL', function(done) {
      esnConfigGetMock = () => Promise.reject(new Error('an_error'));

      getModule().getDlpRule()
        .then(() => done(new Error('should not have resolved')))
        .catch(err => {
          expect(err.message).to.equal('an_error');
          done();
        });
    });

    it('should fail if it cannot generate JWT token', function(done) {
      tokenMock.generate = () => Promise.reject(new Error('an_error'));

      getModule().getDlpRule()
        .then(() => done(new Error('should not have resolved')))
        .catch(err => {
          expect(err.message).to.equal('an_error');
          done();
        });
    });

    it('should connect to James admin client with get DLP rules function', function(done) {
      const domainName = 'a';
      const ruleId = '1';

      JamesClientMock.prototype.dlpRules = {
        get: sinon.stub().returns(Promise.resolve())
      };

      getModule().getDlpRule(domainName, ruleId)
        .then(() => {
          expect(JamesClientMock.prototype.dlpRules.get).to.have.been.calledOnce;
          expect(JamesClientMock.prototype.dlpRules.get).to.have.been.calledWith(domainName, ruleId);

          done();
        }).catch(done);
    });
  });

  describe('The listDlpRules function', function() {
    it('should fail if it cannot get API URL', function(done) {
      esnConfigGetMock = () => Promise.reject(new Error('an_error'));

      getModule().listDlpRules()
        .then(() => done(new Error('should not have resolved')))
        .catch(err => {
          expect(err.message).to.equal('an_error');
          done();
        });
    });

    it('should fail if it cannot generate JWT token', function(done) {
      tokenMock.generate = () => Promise.reject(new Error('an_error'));

      getModule().listDlpRules()
        .then(() => done(new Error('should not have resolved')))
        .catch(err => {
          expect(err.message).to.equal('an_error');
          done();
        });
    });

    it('should connect to James admin client with list DLP rules function', function(done) {
      const domainName = 'a';
      const rulesList = { rules: 'list of rules' };

      JamesClientMock.prototype.dlpRules = {
        list: sinon.stub().returns(Promise.resolve(rulesList))
      };

      getModule().listDlpRules(domainName)
        .then(() => {
          expect(JamesClientMock.prototype.dlpRules.list).to.have.been.calledOnce;
          expect(JamesClientMock.prototype.dlpRules.list).to.have.been.calledWith(domainName);

          done();
        }).catch(done);
    });

    it('should return an array of rules', function(done) {
      const domainName = 'a';
      const rulesList = { rules: [{ id: '1' }, { id: '2' }] };

      JamesClientMock.prototype.dlpRules = {
        list: sinon.stub().returns(Promise.resolve(rulesList))
      };

      getModule().listDlpRules(domainName)
        .then(rules => {
          expect(rules).to.deep.equal(rulesList.rules);

          done();
        }).catch(done);
    });
  });

  describe('The storeDlpRules function', function() {
    it('should fail if it cannot get API URL', function(done) {
      esnConfigGetMock = () => Promise.reject(new Error('an_error'));

      getModule().storeDlpRules()
        .then(() => done(new Error('should not have resolved')))
        .catch(err => {
          expect(err.message).to.equal('an_error');
          done();
        });
    });

    it('should fail if it cannot generate JWT token', function(done) {
      tokenMock.generate = () => Promise.reject(new Error('an_error'));

      getModule().storeDlpRules()
        .then(() => done(new Error('should not have resolved')))
        .catch(err => {
          expect(err.message).to.equal('an_error');
          done();
        });
    });

    it('should connect to James admin client with store DLP rules function', function(done) {
      const domainName = 'a';
      const rules = { rules: 'setOfRules' };

      JamesClientMock.prototype.dlpRules = {
        store: sinon.stub().returns(Promise.resolve())
      };

      getModule().storeDlpRules(domainName, rules)
        .then(() => {
          expect(JamesClientMock.prototype.dlpRules.store).to.have.been.calledOnce;
          expect(JamesClientMock.prototype.dlpRules.store).to.have.been.calledWith(domainName, rules);

          done();
        }).catch(done);
    });
  });
});
