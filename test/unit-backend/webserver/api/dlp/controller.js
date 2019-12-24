const { expect } = require('chai');
const sinon = require('sinon');

describe('The webserver/api/dlp/controller module', function() {
  let controller;
  let clientMock;

  beforeEach(function() {
    clientMock = {};

    controller = require(`${this.moduleHelpers.backendPath}/webserver/api/dlp/controller`)(this.moduleHelpers.dependencies, {
      client: clientMock
    });
  });

  describe('The getRule function', function() {
    it('should respond 200 if successfully get a rule', function(done) {
      const rule = { id: 1 };

      const req = { rule };

      const res = {
        status(code) {
          try {
            expect(code).to.equal(200);

            return {
              json: response => {
                expect(response).to.deep.equal(rule);

                done();
              }
            };
          } catch (error) {
            done(error);
          }
        }
      };

      controller.getRule(req, res);
    });
  });

  describe('The listRules function', function() {
    it('should respond 200 if successfully get list of rules', function(done) {
      const rules = [{ id: 1 }, { id: 2 }];

      clientMock.listDlpRules = sinon.stub().returns(Promise.resolve(rules));

      const req = {
        domain: { name: 'a' }
      };

      const res = {
        status(code) {
          try {
            expect(clientMock.listDlpRules).to.have.been.calledOnce;
            expect(code).to.equal(200);

            return {
              json: response => {
                expect(response).to.deep.equal(rules);

                done();
              }
            };
          } catch (error) {
            done(error);
          }
        }
      };

      controller.listRules(req, res);
    });

    it('should respond 500 if failed get list of rules', function(done) {
      clientMock.listDlpRules = sinon.stub().returns(Promise.reject(new Error('Something wrong')));

      const req = {
        domain: { name: 'a' }
      };

      const res = {
        status(code) {
          try {
            expect(clientMock.listDlpRules).to.have.been.calledOnce;
            expect(code).to.equal(500);

            return {
              json(json) {
                expect(json).to.deep.equal({
                  error: {
                    code: 500,
                    message: 'Server Error',
                    details: `Error while getting DLP rules for domain "${req.domain.name}"`
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

      controller.listRules(req, res);
    });
  });

  describe('The storeRules function', function() {
    it('should respond 204 if successfully store list of rules', function(done) {
      const rules = [{ id: 1 }, { id: 2 }];

      clientMock.storeDlpRules = sinon.stub().returns(Promise.resolve());

      const req = {
        domain: { name: 'a' },
        body: rules
      };

      const res = {
        status(code) {
          try {
            expect(clientMock.storeDlpRules).to.have.been.calledOnce;
            expect(clientMock.storeDlpRules).to.have.been.calledWith(req.domain.name, { rules: req.body });
            expect(code).to.equal(204);
            done();

            return { end: () => {} };
          } catch (error) {
            done(error);

            return { end: () => {} };
          }
        }
      };

      controller.storeRules(req, res);
    });

    it('should respond 500 if failed store list of rules', function(done) {
      clientMock.storeDlpRules = sinon.stub().returns(Promise.reject(new Error('Something wrong')));

      const req = {
        domain: { name: 'a' }
      };

      const res = {
        status(code) {
          try {
            expect(clientMock.storeDlpRules).to.have.been.calledOnce;
            expect(code).to.equal(500);

            return {
              json(json) {
                expect(json).to.deep.equal({
                  error: {
                    code: 500,
                    message: 'Server Error',
                    details: `Error while storing DLP rules for domain "${req.domain.name}"`
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

      controller.storeRules(req, res);
    });
  });
});
