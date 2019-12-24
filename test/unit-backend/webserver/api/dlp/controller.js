const { expect } = require('chai');

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
});
