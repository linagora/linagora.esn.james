'use strict';

/* global chai: false */
/* global sinon: false */

var expect = chai.expect;

describe('The jamesWebadminClient', function() {

  var $rootScope, $q;
  var $windowMock, jamesClientInstanceMock;
  var jamesWebadminClient, jamesWebadminClientProvider, esnConfigMock;
  var domain, serverUrl, username;

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
    username = 'user@abc.com';
    esnConfigMock = {};

    module(function($provide) {
      $provide.value('$window', $windowMock);
    });
    module('esn.configuration', function($provide) {
      $provide.value('esnConfig', function() {
        return esnConfigMock;
      });
    });

    inject(function(
      _$rootScope_,
      _$q_,
      _jamesWebadminClient_,
      _jamesWebadminClientProvider_
    ) {
      $rootScope = _$rootScope_;
      $q = _$q_;
      jamesWebadminClient = _jamesWebadminClient_;
      jamesWebadminClientProvider = _jamesWebadminClientProvider_;

      jamesClientInstanceMock.createDomain = sinon.stub().returns($q.when());
      jamesWebadminClientProvider.get = sinon.stub().returns($q.when(jamesClientInstanceMock));
    });
  });

  describe('The createDomain method', function() {
    it('should reject if failed to create domain in James', function(done) {
      var error = new Error('something wrong');

      esnConfigMock = $q.when(serverUrl);
      jamesClientInstanceMock.createDomain = sinon.stub().returns($q.reject(error));

      jamesWebadminClient.createDomain(domain.name)
        .catch(function(err) {
          expect(jamesClientInstanceMock.createDomain).to.have.been.calledOnce;
          expect(jamesClientInstanceMock.createDomain).to.have.been.calledWith(domain.name);
          expect(err.message).to.equal(error.message);

          done();
        });

      $rootScope.$digest();
    });

    it('should resolve if successfully to create domain in James', function(done) {
      esnConfigMock = $q.when(serverUrl);
      jamesWebadminClient.createDomain(domain.name)
        .then(function() {
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

      esnConfigMock = $q.reject(error);

      jamesWebadminClient.getServerUrl()
        .catch(function(err) {
          expect(err.message).to.equal(error.message);

          done();
        });

      $rootScope.$digest();
    });

    it('should resolve if successfully to get James server URL', function(done) {
      esnConfigMock = $q.when(serverUrl);
      jamesWebadminClient.getServerUrl()
        .then(function(url) {
          expect(url).to.equal(serverUrl);

          done();
        });

      $rootScope.$digest();
    });
  });

  describe('The listDomains function', function() {
    it('should reject if failed to list domains in James', function(done) {
      var error = new Error('something wrong');

      jamesClientInstanceMock.listDomains = sinon.stub().returns($q.reject(error));
      esnConfigMock = $q.when(serverUrl);

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
      esnConfigMock = $q.when(serverUrl);

      jamesWebadminClient.listDomains()
        .then(function(jamesDomains) {
          expect(jamesClientInstanceMock.listDomains).to.have.been.calledOnce;
          expect(jamesDomains).to.equal(domains);

          done();
        });

      $rootScope.$digest();
    });
  });

  describe('The getUserQuota function', function() {
    it('should reject if failed to get user quota', function(done) {
      var error = new Error('something wrong');

      jamesClientInstanceMock.getUserQuota = sinon.stub().returns($q.reject(error));
      esnConfigMock = $q.when(serverUrl);

      jamesWebadminClient.getUserQuota(username)
        .catch(function(err) {
          expect(jamesClientInstanceMock.getUserQuota).to.have.been.calledWith(username);
          expect(err.message).to.equal(error.message);

          done();
        });

      $rootScope.$digest();
    });

    it('should resolve if successfully to get user quota', function(done) {
      var quota = { user: {} };

      jamesClientInstanceMock.getUserQuota = sinon.stub().returns($q.when(quota));
      esnConfigMock = $q.when(serverUrl);

      jamesWebadminClient.getUserQuota(username)
        .then(function(userQuota) {
          expect(jamesClientInstanceMock.getUserQuota).to.have.been.calledWith(username);
          expect(userQuota).to.deep.equal(quota);

          done();
        });

      $rootScope.$digest();
    });
  });

  describe('The setUserQuota function', function() {
    it('should reject if failed to set user quota', function(done) {
      var username = 'foo';
      var quota = {};
      var error = new Error('something wrong');

      jamesClientInstanceMock.setUserQuota = sinon.stub().returns($q.reject(error));
      esnConfigMock = $q.when(serverUrl);

      jamesWebadminClient.setUserQuota(username, quota)
        .catch(function(err) {
          expect(jamesClientInstanceMock.setUserQuota).to.have.been.calledWith(username, quota);
          expect(err.message).to.equal(error.message);

          done();
        });

      $rootScope.$digest();
    });

    it('should resolve if successfully to set user quota', function(done) {
      var username = 'foo';
      var quota = {};

      jamesClientInstanceMock.setUserQuota = sinon.stub().returns($q.when());
      esnConfigMock = $q.when(serverUrl);

      jamesWebadminClient.setUserQuota(username, quota)
        .then(function() {
          expect(jamesClientInstanceMock.setUserQuota).to.have.been.calledWith(username, quota);

          done();
        });

      $rootScope.$digest();
    });

    it('should call jamesClient.deleteUserQuotaCount to delete quota count if the quota count is set as null', function(done) {
      var username = 'foo';
      var quota = {
        count: null,
        size: 1000
      };

      jamesClientInstanceMock.setUserQuota = sinon.stub().returns($q.when());
      jamesClientInstanceMock.deleteUserQuotaCount = sinon.stub().returns($q.when());
      esnConfigMock = $q.when(serverUrl);

      jamesWebadminClient.setUserQuota(username, quota)
        .then(function() {
          expect(jamesClientInstanceMock.setUserQuota).to.have.been.calledWith(username, quota);
          expect(jamesClientInstanceMock.deleteUserQuotaCount).to.have.been.calledWith(username);
          done();
        });

      $rootScope.$digest();
    });

    it('should call jamesClient.deleteUserQuotaSize to delete quota size if the quota size is set as null', function(done) {
      var username = 'foo';
      var quota = {
        count: 12,
        size: null
      };

      jamesClientInstanceMock.setUserQuota = sinon.stub().returns($q.when());
      jamesClientInstanceMock.deleteUserQuotaSize = sinon.stub().returns($q.when());
      esnConfigMock = $q.when(serverUrl);

      jamesWebadminClient.setUserQuota(username, quota)
        .then(function() {
          expect(jamesClientInstanceMock.setUserQuota).to.have.been.calledWith(username, quota);
          expect(jamesClientInstanceMock.deleteUserQuotaSize).to.have.been.calledWith(username);
          done();
        });

      $rootScope.$digest();
    });

    it('should not call jamesClient.setUserQuota to set quota if both quota count and size is set to null', function(done) {
      var username = 'foo';
      var quota = {
        count: null,
        size: null
      };

      jamesClientInstanceMock.setUserQuota = sinon.stub().returns($q.when());
      jamesClientInstanceMock.deleteUserQuotaCount = sinon.stub().returns($q.when());
      jamesClientInstanceMock.deleteUserQuotaSize = sinon.stub().returns($q.when());
      esnConfigMock = $q.when(serverUrl);

      jamesWebadminClient.setUserQuota(username, quota)
        .then(function() {
          expect(jamesClientInstanceMock.setUserQuota).not.to.have.been.called;
          expect(jamesClientInstanceMock.deleteUserQuotaSize).to.have.been.calledWith(username);
          expect(jamesClientInstanceMock.deleteUserQuotaCount).to.have.been.calledWith(username);
          done();
        });

      $rootScope.$digest();
    });
  });

  describe('The getDomainQuota function', function() {
    it('should reject if failed to get domain quota', function(done) {
      var domainName = 'abc';

      esnConfigMock = $q.when(serverUrl);
      jamesClientInstanceMock.getDomainQuota = sinon.stub().returns($q.reject());
      jamesWebadminClient.getDomainQuota(domainName)
        .catch(function() {
          expect(jamesClientInstanceMock.getDomainQuota).to.have.been.calledWith(domainName);
          done();
        });

      $rootScope.$digest();
    });

    it('should resolve if succeed to get domain quota', function(done) {
      var domainName = 'abc';
      var quota = {
        size: 15,
        count: 57
      };

      esnConfigMock = $q.when(serverUrl);
      jamesClientInstanceMock.getDomainQuota = sinon.stub().returns($q.when(quota));

      jamesWebadminClient.getDomainQuota(domainName)
        .then(function(quota) {
          expect(jamesClientInstanceMock.getDomainQuota).to.have.been.calledWith(domainName);
          expect(quota).to.deep.equal(quota);

          done();
        })
        .catch(function(err) {
          done(err || 'should resolve');
        });

      $rootScope.$digest();
    });
  });

  describe('The setDomainQuota function', function() {
    it('should reject if failed to set domain quota', function(done) {
      var domainName = 'abc';
      var quota = { size: 11, count: 45 };

      esnConfigMock = $q.when(serverUrl);
      jamesClientInstanceMock.setDomainQuota = sinon.stub().returns($q.reject());

      jamesWebadminClient.setDomainQuota(domainName, quota)
        .catch(function() {
          expect(jamesClientInstanceMock.setDomainQuota).to.have.been.calledWith(domainName, quota);
          done();
        });

      $rootScope.$digest();
    });

    it('should resolve if succeed to set domain quota', function(done) {
      var domainName = 'abc';
      var quota = { size: 11, count: 45 };

      esnConfigMock = $q.when(serverUrl);
      jamesClientInstanceMock.setDomainQuota = sinon.stub().returns($q.when());

      jamesWebadminClient.setDomainQuota(domainName, quota)
        .then(function() {
          expect(jamesClientInstanceMock.setDomainQuota).to.have.been.calledWith(domainName, quota);
          done();
        })
        .catch(done);

      $rootScope.$digest();
    });

    it('should call jamesClient.deleteDomainQuotaCount to delete quota count if the quota count is set as null', function(done) {
      var username = 'foo';
      var quota = {
        count: null,
        size: 1000
      };

      jamesClientInstanceMock.setDomainQuota = sinon.stub().returns($q.when());
      jamesClientInstanceMock.deleteDomainQuotaCount = sinon.stub().returns($q.when());
      esnConfigMock = $q.when(serverUrl);

      jamesWebadminClient.setDomainQuota(username, quota)
        .then(function() {
          expect(jamesClientInstanceMock.setDomainQuota).to.have.been.calledWith(username, quota);
          expect(jamesClientInstanceMock.deleteDomainQuotaCount).to.have.been.calledWith(username);
          done();
        });

      $rootScope.$digest();
    });

    it('should call jamesClient.deleteDomainQuotaSize to delete quota size if the quota size is set as null', function(done) {
      var username = 'foo';
      var quota = {
        count: 12,
        size: null
      };

      jamesClientInstanceMock.setDomainQuota = sinon.stub().returns($q.when());
      jamesClientInstanceMock.deleteDomainQuotaSize = sinon.stub().returns($q.when());
      esnConfigMock = $q.when(serverUrl);

      jamesWebadminClient.setDomainQuota(username, quota)
        .then(function() {
          expect(jamesClientInstanceMock.setDomainQuota).to.have.been.calledWith(username, quota);
          expect(jamesClientInstanceMock.deleteDomainQuotaSize).to.have.been.calledWith(username);
          done();
        });

      $rootScope.$digest();
    });

    it('should not call jamesClient.setDomainQuota to set quota if both quota count and size is set to null', function(done) {
      var username = 'foo';
      var quota = {
        count: null,
        size: null
      };

      jamesClientInstanceMock.setDomainQuota = sinon.stub().returns($q.when());
      jamesClientInstanceMock.deleteDomainQuotaCount = sinon.stub().returns($q.when());
      jamesClientInstanceMock.deleteDomainQuotaSize = sinon.stub().returns($q.when());
      esnConfigMock = $q.when(serverUrl);

      jamesWebadminClient.setDomainQuota(username, quota)
        .then(function() {
          expect(jamesClientInstanceMock.setDomainQuota).not.to.have.been.called;
          expect(jamesClientInstanceMock.deleteDomainQuotaSize).to.have.been.calledWith(username);
          expect(jamesClientInstanceMock.deleteDomainQuotaCount).to.have.been.calledWith(username);
          done();
        });

      $rootScope.$digest();
    });
  });

  describe('The getGlobalQuota function', function() {
    it('should reject if failed to get global quota', function(done) {
      esnConfigMock = $q.when(serverUrl);
      jamesClientInstanceMock.getQuota = sinon.stub().returns($q.reject());
      jamesWebadminClient.getGlobalQuota()
        .catch(function() {
          expect(jamesClientInstanceMock.getQuota).to.have.been.called;
          done();
        });

      $rootScope.$digest();
    });

    it('should resolve if succeed to get global quota', function(done) {
      var quota = {
        size: 15,
        count: 57
      };

      esnConfigMock = $q.when(serverUrl);
      jamesClientInstanceMock.getQuota = sinon.stub().returns($q.when(quota));

      jamesWebadminClient.getGlobalQuota()
        .then(function(quota) {
          expect(jamesClientInstanceMock.getQuota).to.have.been.called;
          expect(quota).to.deep.equal(quota);

          done();
        })
        .catch(function(err) {
          done(err || 'should resolve');
        });

      $rootScope.$digest();
    });
  });

  describe('The setGlobalQuota function', function() {
    it('should reject if failed to set global quota', function(done) {
      var quota = {};
      var error = new Error('something wrong');

      jamesClientInstanceMock.setQuota = sinon.stub().returns($q.reject(error));
      esnConfigMock = $q.when(serverUrl);

      jamesWebadminClient.setGlobalQuota(quota)
        .catch(function(err) {
          expect(jamesClientInstanceMock.setQuota).to.have.been.calledWith(quota);
          expect(err.message).to.equal(error.message);

          done();
        });

      $rootScope.$digest();
    });

    it('should resolve if successfully to set user quota', function(done) {
      var quota = {};

      jamesClientInstanceMock.setQuota = sinon.stub().returns($q.when());
      esnConfigMock = $q.when(serverUrl);

      jamesWebadminClient.setGlobalQuota(quota)
        .then(function() {
          expect(jamesClientInstanceMock.setQuota).to.have.been.calledWith(quota);

          done();
        });

      $rootScope.$digest();
    });

    it('should call jamesClient.deleteQuotaCount to delete quota count if the quota count is set as null', function(done) {
      var quota = {
        count: null,
        size: 1000
      };

      jamesClientInstanceMock.setQuota = sinon.stub().returns($q.when());
      jamesClientInstanceMock.deleteQuotaCount = sinon.stub().returns($q.when());
      esnConfigMock = $q.when(serverUrl);

      jamesWebadminClient.setGlobalQuota(quota)
        .then(function() {
          expect(jamesClientInstanceMock.setQuota).to.have.been.calledWith(quota);
          expect(jamesClientInstanceMock.deleteQuotaCount).to.have.been.called;
          done();
        });

      $rootScope.$digest();
    });

    it('should call jamesClient.deleteQuotaSize to delete quota size if the quota size is set as null', function(done) {
      var quota = {
        count: 12,
        size: null
      };

      jamesClientInstanceMock.setQuota = sinon.stub().returns($q.when());
      jamesClientInstanceMock.deleteQuotaSize = sinon.stub().returns($q.when());
      esnConfigMock = $q.when(serverUrl);

      jamesWebadminClient.setGlobalQuota(quota)
        .then(function() {
          expect(jamesClientInstanceMock.setQuota).to.have.been.calledWith(quota);
          expect(jamesClientInstanceMock.deleteQuotaSize).to.have.been.called;
          done();
        });

      $rootScope.$digest();
    });

    it('should not call jamesClient.setQuota to set quota if both quota count and size is set to null', function(done) {
      var quota = {
        count: null,
        size: null
      };

      jamesClientInstanceMock.setQuota = sinon.stub().returns($q.when());
      jamesClientInstanceMock.deleteQuotaCount = sinon.stub().returns($q.when());
      jamesClientInstanceMock.deleteQuotaSize = sinon.stub().returns($q.when());
      esnConfigMock = $q.when(serverUrl);

      jamesWebadminClient.setGlobalQuota(quota)
        .then(function() {
          expect(jamesClientInstanceMock.setQuota).not.to.have.been.called;
          expect(jamesClientInstanceMock.deleteQuotaCount).to.have.been.called;
          expect(jamesClientInstanceMock.deleteQuotaSize).to.have.been.called;
          done();
        });

      $rootScope.$digest();
    });
  });
});
