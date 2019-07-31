const { expect } = require('chai');
const sinon = require('sinon');

describe('The webserver/api/domain/alias/controller module', function() {
  let aliasController;
  let aliasLibMock;

  beforeEach(function() {
    aliasLibMock = {};

    aliasController = require(this.moduleHelpers.backendPath + '/webserver/api/domain/alias/controller')(this.moduleHelpers.dependencies, {
      domain: {
        alias: aliasLibMock
      }
    });
  });

  describe('The addDomainAlias function', function() {
    it('should respond 204 if successful to add alias for domain', function(done) {
      aliasLibMock.addDomainAliases = sinon.stub().returns(Promise.resolve());

      const req = {
        domain: {
          id: '123',
          name: 'open-paas.org'
        },
        params: {
          alias: 'linagora.com'
        }
      };
      const res = {
        status(code) {
          try {
            expect(code).to.equal(204);
            expect(aliasLibMock.addDomainAliases).to.have.been.calledWith(req.domain, req.params.alias);
            done();

            return { end: () => {} };
          } catch (error) {
            done(error);

            return { end: () => {} };
          }
        }
      };

      aliasController.addDomainAlias(req, res);
    });

    it('should respond 500 if failed to add domain alias for internal problems', function(done) {
      aliasLibMock.addDomainAliases = sinon.stub().returns(Promise.resolve());

      const req = {
        domain: {
          id: '123',
          name: 'open-paas.org'
        },
        params: {
          alias: 'linagora.com'
        }
      };
      const res = {
        status(code) {
          expect(code).to.equal(500);

          return {
            json(json) {
              try {
                expect(aliasLibMock.addDomainAliases).to.have.been.calledWith(req.domain, req.params.alias);
                expect(json.error.details).to.equal(`Error while creating alias "${req.params.alias}" for domain "${req.domain.id}"`);
                done();
              } catch (error) {
                done(error);
              }
            }
          };
        }
      };

      aliasController.addDomainAlias(req, res);
    });
  });

  describe('The getDomainAliases function', function() {
    it('should respond 200 if being successful to list domain aliases', function(done) {
      aliasLibMock.getDomainAliases = sinon.stub()
        .returns(Promise.resolve([{ source: 'linagora1.org' }, { source: 'linagora2.org' }]));

      const req = {
        domain: { id: '123', name: 'open-paas.org' }
      };

      const res = {
        status(code) {
          try {
            expect(code).to.equal(200);

            return {
              json(json) {
                expect(json).to.deep.equal(['linagora1.org', 'linagora2.org']);
                expect(aliasLibMock.getDomainAliases).to.have.been.calledWith(req.domain);
                done();
              }
            };
          } catch (error) {
            done(error);

            return { end: () => {} };
          }
        }
      };

      aliasController.getDomainAliases(req, res);
    });

    it('should respond 500 if it failed to get domain aliases due to internal problems', function(done) {
      aliasLibMock.getDomainAliases = sinon.stub().returns(Promise.resolve());

      const req = {
        domain: {
          id: '123',
          name: 'open-paas.org'
        }
      };

      const res = {
        status(code) {
          expect(code).to.equal(500);

          return {
            json(json) {
              try {
                expect(aliasLibMock.getDomainAliases).to.have.been.calledWith(req.domain);
                expect(json.error.details).to.equal(`Error while getting aliases for domain "${req.domain.id}"`);
                done();
              } catch (error) {
                done(error);
              }
            }
          };
        }
      };

      aliasController.getDomainAliases(req, res);
    });
  });

  describe('The removeDomainAlias function', function() {
    it('should respond 204 if successful to remove alias for domain', function(done) {
      aliasLibMock.removeDomainAliases = sinon.stub().returns(Promise.resolve());

      const req = {
        domain: {
          id: '123',
          name: 'open-paas.org'
        },
        params: {
          alias: 'linagora.com'
        }
      };
      const res = {
        status(code) {
          try {
            expect(code).to.equal(204);
            expect(aliasLibMock.removeDomainAliases).to.have.been.calledWith(req.domain, req.params.alias);
            done();

            return { end: () => {} };
          } catch (error) {
            done(error);

            return { end: () => {} };
          }
        }
      };

      aliasController.removeDomainAlias(req, res);
    });

    it('should respond 500 if failed to remove domain alias for internal problems', function(done) {
      aliasLibMock.removeDomainAliases = sinon.stub().returns(Promise.resolve());

      const req = {
        domain: {
          id: '123',
          name: 'open-paas.org'
        },
        params: {
          alias: 'linagora.com'
        }
      };
      const res = {
        status(code) {
          expect(code).to.equal(500);

          return {
            json(json) {
              try {
                expect(aliasLibMock.removeDomainAliases).to.have.been.calledWith(req.domain, req.params.alias);
                expect(json.error.details).to.equal(`Error while removing alias "${req.params.alias}" for domain "${req.domain.id}"`);
                done();
              } catch (error) {
                done(error);
              }
            }
          };
        }
      };

      aliasController.removeDomainAlias(req, res);
    });
  });
});
