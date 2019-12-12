const { expect } = require('chai');
const sinon = require('sinon');

describe('The webserver/api/quota/controller module', function() {
  let getModule, clientMock;
  const quota = { count: 100, size: 100 };

  beforeEach(function() {
    clientMock = {};

    getModule = () =>
      require(`${this.moduleHelpers.backendPath}/webserver/api/quota/controller`)(this.moduleHelpers.dependencies, { client: clientMock });
  });

  describe('The getQuota method', function() {
    describe('When scope is platform', function() {
      it('should respond 200 if success to get quota', function(done) {
        clientMock.getPlatformQuota = sinon.stub().returns(Promise.resolve(quota));

        const req = {
          query: { scope: 'platform' }
        };
        const res = {
          status(code) {
            expect(code).to.equal(200);

            return {
              json(json) {
                expect(json).to.deep.equal(quota);
                expect(clientMock.getPlatformQuota).to.have.been.calledOnce;
                done();
              }
            };
          }
        };

        getModule().getQuota(req, res);
      });

      it('should respond 500 if it fails to get quota', function(done) {
        clientMock.getPlatformQuota = sinon.stub().returns(Promise.reject(new Error('something wrong')));

        const req = {
          query: { scope: 'platform' }
        };
        const res = {
          status(code) {
            expect(code).to.equal(500);

            return {
              json(json) {
                expect(json).to.deep.equal({
                  error: {
                    code: 500,
                    message: 'Server Error',
                    details: 'Error while getting quota'
                  }
                });
                expect(clientMock.getPlatformQuota).to.have.been.calledOnce;
                done();
              }
            };
          }
        };

        getModule().getQuota(req, res);
      });
    });

    describe('When scope is domain', function() {
      const domain = { name: 'domainName' };

      it('should respond 200 if success to get quota', function(done) {
        clientMock.getDomainQuota = sinon.stub().returns(Promise.resolve(quota));

        const req = {
          query: { scope: 'domain' },
          domain
        };
        const res = {
          status(code) {
            expect(code).to.equal(200);

            return {
              json(json) {
                expect(json).to.deep.equal(quota);
                expect(clientMock.getDomainQuota).to.have.been.calledWith(domain.name);
                done();
              }
            };
          }
        };

        getModule().getQuota(req, res);
      });

      it('should respond 500 if it fails to get quota', function(done) {
        clientMock.getDomainQuota = sinon.stub().returns(Promise.reject(new Error('something wrong')));

        const req = {
          query: { scope: 'domain' },
          domain
        };
        const res = {
          status(code) {
            expect(code).to.equal(500);

            return {
              json(json) {
                expect(json).to.deep.equal({
                  error: {
                    code: 500,
                    message: 'Server Error',
                    details: 'Error while getting quota'
                  }
                });
                expect(clientMock.getDomainQuota).to.have.been.calledWith(domain.name);
                done();
              }
            };
          }
        };

        getModule().getQuota(req, res);
      });
    });

    describe('When scope is user', function() {
      const targetUser = { preferredEmail: 'user@lng.org' };

      it('should respond 200 if success to get quota', function(done) {
        clientMock.getUserQuota = sinon.stub().returns(Promise.resolve(quota));

        const req = {
          query: { scope: 'user' },
          targetUser
        };
        const res = {
          status(code) {
            expect(code).to.equal(200);

            return {
              json(json) {
                expect(json).to.deep.equal(quota);
                expect(clientMock.getUserQuota).to.have.been.calledWith(targetUser.preferredEmail);
                done();
              }
            };
          }
        };

        getModule().getQuota(req, res);
      });

      it('should respond 500 if it fails to get quota', function(done) {
        clientMock.getUserQuota = sinon.stub().returns(Promise.reject(new Error('something wrong')));

        const req = {
          query: { scope: 'user' },
          targetUser
        };
        const res = {
          status(code) {
            expect(code).to.equal(500);

            return {
              json(json) {
                expect(json).to.deep.equal({
                  error: {
                    code: 500,
                    message: 'Server Error',
                    details: 'Error while getting quota'
                  }
                });
                expect(clientMock.getUserQuota).to.have.been.calledWith(targetUser.preferredEmail);
                done();
              }
            };
          }
        };

        getModule().getQuota(req, res);
      });
    });
  });

  describe('The setQuota method', function() {
    describe('When scope is platform', function() {
      it('should respond 200 if success to set quota', function(done) {
        clientMock.setPlatformQuota = sinon.stub().returns(Promise.resolve());

        const req = {
          query: { scope: 'platform' },
          body: quota
        };
        const res = {
          status(code) {
            expect(code).to.equal(204);

            return {
              end() {
                expect(clientMock.setPlatformQuota).to.have.been.calledWith(quota);
                done();
              }
            };
          }
        };

        getModule().setQuota(req, res);
      });

      it('should respond 500 if it fails to set quota', function(done) {
        clientMock.setPlatformQuota = sinon.stub().returns(Promise.reject(new Error('something wrong')));

        const req = {
          query: { scope: 'platform' },
          body: quota
        };
        const res = {
          status(code) {
            expect(code).to.equal(500);

            return {
              json(json) {
                expect(json).to.deep.equal({
                  error: {
                    code: 500,
                    message: 'Server Error',
                    details: 'Error while setting quota'
                  }
                });
                expect(clientMock.setPlatformQuota).to.have.been.calledWith(quota);
                done();
              }
            };
          }
        };

        getModule().setQuota(req, res);
      });
    });

    describe('When scope is domain', function() {
      const domain = { name: 'domainName' };

      it('should respond 200 if success to set quota', function(done) {
        clientMock.setDomainQuota = sinon.stub().returns(Promise.resolve());

        const req = {
          query: { scope: 'domain' },
          body: quota,
          domain
        };
        const res = {
          status(code) {
            expect(code).to.equal(204);

            return {
              end() {
                expect(clientMock.setDomainQuota).to.have.been.calledWith(domain.name, quota);
                done();
              }
            };
          }
        };

        getModule().setQuota(req, res);
      });

      it('should respond 500 if it fails to set quota', function(done) {
        clientMock.setDomainQuota = sinon.stub().returns(Promise.reject(new Error('something wrong')));

        const req = {
          query: { scope: 'domain' },
          body: quota,
          domain
        };
        const res = {
          status(code) {
            expect(code).to.equal(500);

            return {
              json(json) {
                expect(json).to.deep.equal({
                  error: {
                    code: 500,
                    message: 'Server Error',
                    details: 'Error while setting quota'
                  }
                });
                expect(clientMock.setDomainQuota).to.have.been.calledWith(domain.name, quota);
                done();
              }
            };
          }
        };

        getModule().setQuota(req, res);
      });
    });

    describe('When scope is user', function() {
      const targetUser = { preferredEmail: 'user@lng.org' };

      it('should respond 200 if success to set quota', function(done) {
        clientMock.setUserQuota = sinon.stub().returns(Promise.resolve());

        const req = {
          query: { scope: 'user' },
          body: quota,
          targetUser
        };
        const res = {
          status(code) {
            expect(code).to.equal(204);

            return {
              end() {
                expect(clientMock.setUserQuota).to.have.been.calledWith(targetUser.preferredEmail, quota);
                done();
              }
            };
          }
        };

        getModule().setQuota(req, res);
      });

      it('should respond 500 if it fails to set quota', function(done) {
        clientMock.setUserQuota = sinon.stub().returns(Promise.reject(new Error('something wrong')));

        const req = {
          query: { scope: 'user' },
          body: quota,
          targetUser
        };
        const res = {
          status(code) {
            expect(code).to.equal(500);

            return {
              json(json) {
                expect(json).to.deep.equal({
                  error: {
                    code: 500,
                    message: 'Server Error',
                    details: 'Error while setting quota'
                  }
                });
                expect(clientMock.setUserQuota).to.have.been.calledWith(targetUser.preferredEmail, quota);
                done();
              }
            };
          }
        };

        getModule().setQuota(req, res);
      });
    });
  });
});
