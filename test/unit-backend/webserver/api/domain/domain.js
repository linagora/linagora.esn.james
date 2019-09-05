const { expect } = require('chai');
const sinon = require('sinon');

describe('The webserver/api/domain/controller module', function() {
  let controller;
  let domainLibMock;

  beforeEach(function() {
    domainLibMock = {};

    controller = require(`${this.moduleHelpers.backendPath}/webserver/api/domain/controller`)(this.moduleHelpers.dependencies, {
      domain: domainLibMock
    });
  });

  describe('The listDomains function', function() {
    it('should respond 200 if successful to list domains', function(done) {
      const domains = ['foo.lng', 'bar.lng'];

      domainLibMock.listDomains = sinon.stub().returns(Promise.resolve(domains));

      const req = {};
      const res = {
        status(code) {
          try {
            expect(code).to.equal(200);
            expect(domainLibMock.listDomains).to.have.been.calledOnce;

            return {
              json: _domains => {
                expect(_domains).to.deep.equal(domains);
                done();
              }
            };
          } catch (error) {
            done(error);
          }
        }
      };

      controller.listDomains(req, res);
    });

    it('should respond 500 if failed to list domains', function(done) {
      domainLibMock.listDomains = sinon.stub().returns(Promise.reject());

      const req = {};
      const res = {
        status(code) {
          try {
            expect(code).to.equal(500);
            expect(domainLibMock.listDomains).to.have.been.calledOnce;

            return {
              json: response => {
                expect(response.error.details).to.equal('Error while listing domains from James server');
                done();
              }
            };
          } catch (error) {
            done(error);
          }
        }
      };

      controller.listDomains(req, res);
    });
  });
});
