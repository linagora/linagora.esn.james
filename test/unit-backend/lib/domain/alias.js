const sinon = require('sinon');
const { expect } = require('chai');
const mockery = require('mockery');

describe('The lib/domain/alias module', function() {
  let aliasModule;
  let clientMock;

  beforeEach(function() {
    clientMock = {};
    mockery.registerMock('../client', () => clientMock);
    aliasModule = require(this.moduleHelpers.backendPath + '/lib/domain/alias')(this.moduleHelpers.dependencies);
  });

  describe('The addDomainAliases function', function() {
    it('should return rejected Promise if domain is undefined/null', function(done) {
      aliasModule.addDomainAliases(null, [])
        .then(() => done('should not resolved'))
        .catch(err => {
          expect(err.message).to.equal('domain cannot be null');
          done();
        });
    });

    it('should return rejected Promise if aliases is undefined/null', function(done) {
      aliasModule.addDomainAliases('openpaas.org', null)
        .then(() => done('should not resolved'))
        .catch(err => {
          expect(err.message).to.equal('alias(es) cannot be null');
          done();
        });
    });

    it('should return rejected Promise of aliases is neither string or array', function(done) {
      clientMock.addDomainAliases = sinon.stub().returns(Promise.resolve());

      aliasModule.addDomainAliases('openpaas.org', 12)
        .then(() => done('should not resolved'))
        .catch(err => {
          expect(err.message).to.equal('alias(es) must be either string or array');
          done();
        });
    });

    it('should accept alias as a string', function(done) {
      clientMock.addDomainAliases = sinon.stub().returns(Promise.resolve());

      aliasModule.addDomainAliases('openpaas.org', 'linagora.com')
        .then(() => {
          expect(clientMock.addDomainAliases).to.have.been.calledWith('openpaas.org', ['linagora.com']);
          done();
        })
        .catch(done);
    });

    it('should accept alias as an array', function(done) {
      clientMock.addDomainAliases = sinon.stub().returns(Promise.resolve());

      aliasModule.addDomainAliases('openpaas.org', ['linagora.com', 'linagora.org'])
        .then(() => {
          expect(clientMock.addDomainAliases).to.have.been.calledWith('openpaas.org', ['linagora.com', 'linagora.org']);
          done();
        })
        .catch(done);
    });
  });

  describe('The removeDomainAliases function', function() {
    it('should return rejected Promise if domain is undefined/null', function(done) {
      aliasModule.addDomainAliases(null, [])
        .then(() => done('should not resolved'))
        .catch(err => {
          expect(err.message).to.equal('domain cannot be null');
          done();
        });
    });

    it('should return rejected Promise if aliases is undefined/null', function(done) {
      aliasModule.addDomainAliases('openpaas.org', null)
        .then(() => done('should not resolved'))
        .catch(err => {
          expect(err.message).to.equal('alias(es) cannot be null');
          done();
        });
    });

    it('should return rejected Promise of aliases is neither string or array', function(done) {
      clientMock.addDomainAliases = sinon.stub().returns(Promise.resolve());

      aliasModule.addDomainAliases('openpaas.org', 12)
        .then(() => done('should not resolved'))
        .catch(err => {
          expect(err.message).to.equal('alias(es) must be either string or array');
          done();
        });
    });

    it('should accept alias as a string', function(done) {
      clientMock.addDomainAliases = sinon.stub().returns(Promise.resolve());

      aliasModule.addDomainAliases('openpaas.org', 'linagora.com')
        .then(() => {
          expect(clientMock.addDomainAliases).to.have.been.calledWith('openpaas.org', ['linagora.com']);
          done();
        })
        .catch(done);
    });

    it('should accept alias as an array', function(done) {
      clientMock.addDomainAliases = sinon.stub().returns(Promise.resolve());

      aliasModule.addDomainAliases('openpaas.org', ['linagora.com', 'linagora.org'])
        .then(() => {
          expect(clientMock.addDomainAliases).to.have.been.calledWith('openpaas.org', ['linagora.com', 'linagora.org']);
          done();
        })
        .catch(done);
    });
  });
});
