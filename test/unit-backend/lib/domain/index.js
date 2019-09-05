const sinon = require('sinon');
const { expect } = require('chai');
const mockery = require('mockery');

describe('The lib/domain module', function() {
  let getModule;
  let clientMock;

  beforeEach(function() {
    clientMock = {};
    mockery.registerMock('../client', () => clientMock);
    getModule = () => require(`${this.moduleHelpers.backendPath}/lib/domain`)(this.moduleHelpers.dependencies);
  });

  describe('The listDomains function', function() {
    it('should reject if failed to list James domains', function(done) {
      clientMock.listDomains = sinon.stub().returns(Promise.reject(new Error('something bad')));

      getModule().listDomains()
        .then(() => done('should not resolve'))
        .catch(err => {
          expect(err.message).to.equal('something bad');
          expect(clientMock.listDomains).to.have.been.calledOnce;
          done();
        });
    });

    it('should resolve if success to list James domains', function(done) {
      const domains = ['foo.lng', 'bar.lng'];

      clientMock.listDomains = sinon.stub().returns(Promise.resolve(domains));

      getModule().listDomains()
        .then(_domains => {
          expect(_domains).to.deep.equal(domains);
          expect(clientMock.listDomains).to.have.been.calledOnce;
          done();
        })
        .catch(err => done(err || 'should resolve'));
    });
  });
});
