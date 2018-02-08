'use strict';

/* global chai: false */
/* global sinon: false */

var expect = chai.expect;

describe('The jamesWebadminClient', function() {

  var $rootScope, $q, jamesWebadminClient, jamesWebadminClientProvider, esnConfigApi;
  var $windowMock, jamesClientInstanceMock;
  var domain, serverUrl;

  beforeEach(function() {
    module('linagora.esn.james');

    jamesClientInstanceMock = {};

    $windowMock = {
      james: {
        Client: function() {
          return jamesClientInstanceMock;
        }
      }
    };

    domain = { name: 'abc.com' };
    serverUrl = 'http://james.com';

    angular.mock.module(function($provide) {
      $provide.value('$window', $windowMock);
    });

    inject(function(
      _$rootScope_,
      _$q_,
      _jamesWebadminClient_,
      _jamesWebadminClientProvider_,
      _esnConfigApi_
    ) {
      $rootScope = _$rootScope_;
      $q = _$q_;
      jamesWebadminClient = _jamesWebadminClient_;
      jamesWebadminClientProvider = _jamesWebadminClientProvider_;
      esnConfigApi = _esnConfigApi_;

      jamesClientInstanceMock.createDomain = sinon.stub().returns($q.when());
      jamesWebadminClientProvider.get = sinon.stub().returns($q.when(jamesClientInstanceMock));
      esnConfigApi.getPlatformConfigurations = sinon.stub().returns($q.when([{
        name: 'linagora.esn.james',
        configurations: [{
          name: 'webadminApiFrontend',
          value: serverUrl
        }]
      }]));
    });
  });

  describe('The createDomain method', function() {
    it('should reject if failed to create domain in James', function(done) {
      var error = new Error('something wrong');

      jamesClientInstanceMock.createDomain = sinon.stub().returns($q.reject(error));

      jamesWebadminClient.createDomain(domain.name)
        .catch(function(err) {
          expect(esnConfigApi.getPlatformConfigurations).to.have.been.calledOnce;
          expect(jamesClientInstanceMock.createDomain).to.have.been.calledOnce;
          expect(jamesClientInstanceMock.createDomain).to.have.been.calledWith(domain.name);
          expect(err.message).to.equal(error.message);

          done();
        });

      $rootScope.$digest();
    });

    it('should resolve if successfully to create domain in James', function(done) {
      jamesWebadminClient.createDomain(domain.name)
        .then(function() {
          expect(esnConfigApi.getPlatformConfigurations).to.have.been.calledOnce;
          expect(jamesClientInstanceMock.createDomain).to.have.been.calledOnce;
          expect(jamesClientInstanceMock.createDomain).to.have.been.calledWith(domain.name);

          done();
        });

      $rootScope.$digest();
    });
  });

  describe('The getServerUrl function', function() {
    it('should reject if failed to get James server URL', function(done) {
      var error = new Error('something wrong');

      esnConfigApi.getPlatformConfigurations = sinon.stub().returns($q.reject(error));

      jamesWebadminClient.getServerUrl()
        .catch(function(err) {
          expect(esnConfigApi.getPlatformConfigurations).to.have.been.calledOnce;
          expect(err.message).to.equal(error.message);

          done();
        });

      $rootScope.$digest();
    });

    it('should resolve if successfully to get James server URL', function(done) {
      jamesWebadminClient.getServerUrl()
        .then(function() {
          expect(esnConfigApi.getPlatformConfigurations).to.have.been.calledOnce;

          done();
        });

      $rootScope.$digest();
    });
  });

  describe('The listDomains function', function() {
    it('should reject if failed to list domains in James', function(done) {
      var error = new Error('something wrong');

      jamesClientInstanceMock.listDomains = sinon.stub().returns($q.reject(error));

      jamesWebadminClient.listDomains()
        .catch(function(err) {
          expect(jamesClientInstanceMock.listDomains).to.have.been.calledOnce;
          expect(err.message).to.equal(error.message);

          done();
        });

      $rootScope.$digest();
    });

    it('should resolve if successfully to list domains in James', function(done) {
      var domains = ['awesome.com'];

      jamesClientInstanceMock.listDomains = sinon.stub().returns($q.when(domains));

      jamesWebadminClient.listDomains()
        .then(function(jamesDomains) {
          expect(jamesClientInstanceMock.listDomains).to.have.been.calledOnce;
          expect(jamesDomains).to.equal(domains);

          done();
        });

      $rootScope.$digest();
    });
  });
});
