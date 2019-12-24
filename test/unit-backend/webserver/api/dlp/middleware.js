const { expect } = require('chai');
const sinon = require('sinon');
const mockery = require('mockery');

describe('The webserver/api/dlp/middleware module', function() {
  let middleware;
  let clientMock;

  beforeEach(function() {
    mockery.registerMock('./validator', () => ({ validator: () => {} }));
    clientMock = {};

    middleware = require(`${this.moduleHelpers.backendPath}/webserver/api/dlp/middleware`)(this.moduleHelpers.dependencies, {
      client: clientMock
    });
  });

  describe('The loadRule function', function() {
    it('should respond 404 if there is no rule in response from James', function(done) {
      const err = {
        response: {
          status: 404
        }
      };

      clientMock.getDlpRule = sinon.stub().returns(Promise.reject(err));

      const req = {
        params: { ruleId: '1' },
        domain: { name: 'a' }
      };

      const res = {
        status(code) {
          try {
            expect(clientMock.getDlpRule).to.have.been.calledOnce;
            expect(code).to.equal(404);

            return {
              json: response => {
                expect(response.error).to.deep.equal({
                  code: 404,
                  message: 'Not Found',
                  details: `There is no rule "${req.params.ruleId}" on "${req.domain.name}"`
                });

                done();
              }
            };
          } catch (error) {
            done(error);
          }
        }
      };

      middleware.loadRule(req, res);
    });

    it('should respond 500 if failed to get rule', function(done) {
      const err = {
        response: {
          status: 500
        }
      };

      clientMock.getDlpRule = sinon.stub().returns(Promise.reject(err));

      const req = {
        params: { ruleId: '1' },
        domain: { name: 'a' }
      };

      const res = {
        status(code) {
          try {
            expect(clientMock.getDlpRule).to.have.been.calledOnce;
            expect(code).to.equal(500);

            return {
              json(json) {
                expect(json).to.deep.equal({
                  error: {
                    code: 500,
                    message: 'Server Error',
                    details: `Error while getting DLP rule id "${req.params.ruleId}" for domain "${req.domain.name}"`
                  }
                });
                done();
              }
            };
          } catch (error) {
            done(error);
          }
        }
      };

      middleware.loadRule(req, res);
    });
  });
});
