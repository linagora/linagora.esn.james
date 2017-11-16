const q = require('q');
const { expect } = require('chai');
const sinon = require('sinon');

describe.only('The webserver/api/sync/controller module', function() {
  let getModule;
  let syncModuleMock;

  beforeEach(function() {
    syncModuleMock = { group: {} };

    getModule = () =>
      require(this.moduleHelpers.backendPath + '/webserver/api/sync/controller')(this.moduleHelpers.dependencies, { sync: syncModuleMock });
  });

  describe('The getGroupSyncStatus function', function() {
    it('should respond 200 with sync status of group', function(done) {
      const status = { ok: true };
      const req = {
        group: { email: 'group@email' }
      };
      const res = {
        status(code) {
          expect(code).to.equal(200);

          return {
            json(json) {
              expect(json).to.deep.equal(status);
              expect(syncModuleMock.group.getStatus).to.have.been.calledWith(req.group);
              done();
            }
          };
        }
      };

      syncModuleMock.group.getStatus = sinon.stub().returns(q.resolve(status));

      getModule().getGroupSyncStatus(req, res);
    });

    it('should respond 500 if it fails to get group status', function(done) {
      const req = {
        group: { id: '123', email: 'group@email' }
      };
      const res = {
        status(code) {
          expect(code).to.equal(500);

          return {
            json(json) {
              expect(json.error.details).to.equal(`Error while getting group synchronize status "${req.group.id}"`);
              expect(syncModuleMock.group.getStatus).to.have.been.calledWith(req.group);
              done();
            }
          };
        }
      };

      syncModuleMock.group.getStatus = sinon.stub().returns(q.reject(new Error('an_error')));

      getModule().getGroupSyncStatus(req, res);
    });
  });

  describe('The syncGroup function', function() {
    it('should respond 204 on success', function(done) {
      const req = {
        group: { email: 'group@email' }
      };
      const res = {
        status(code) {
          expect(code).to.equal(204);

          return {
            end() {
              expect(syncModuleMock.group.sync).to.have.been.calledWith(req.group);
              done();
            }
          };
        }
      };

      syncModuleMock.group.sync = sinon.stub().returns(q.resolve());

      getModule().syncGroup(req, res);
    });

    it('should respond 500 if it fails to sync group', function(done) {
      const req = {
        group: { id: '123', email: 'group@email' }
      };
      const res = {
        status(code) {
          expect(code).to.equal(500);

          return {
            json(json) {
              expect(json.error.details).to.equal(`Error while synchronizing group "${req.group.id}"`);
              expect(syncModuleMock.group.sync).to.have.been.calledWith(req.group);
              done();
            }
          };
        }
      };

      syncModuleMock.group.sync = sinon.stub().returns(q.reject(new Error('an_error')));

      getModule().syncGroup(req, res);
    });
  });
});
