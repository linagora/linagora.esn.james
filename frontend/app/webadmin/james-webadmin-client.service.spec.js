'use strict';

/* global chai: false */
/* global sinon: false */

var expect = chai.expect;

describe('The jamesWebadminClient', function() {

  var $rootScope, $q;
  var $windowMock, jamesClientInstanceMock;
  var jamesWebadminClient, jamesWebadminClientProvider, esnConfigMock, FileSaver;
  var domain, serverUrl, username;
  var REPOSITORY_ID = 'file://var/www/example';

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
      _jamesWebadminClientProvider_,
      _FileSaver_
    ) {
      $rootScope = _$rootScope_;
      $q = _$q_;
      jamesWebadminClient = _jamesWebadminClient_;
      jamesWebadminClientProvider = _jamesWebadminClientProvider_;
      FileSaver = _FileSaver_;

      esnConfigMock = $q.when(serverUrl);
      jamesClientInstanceMock.createDomain = sinon.stub().returns($q.when());
      jamesWebadminClientProvider.get = sinon.stub().returns($q.when(jamesClientInstanceMock));
    });
  });

  describe('The createDomain method', function() {
    it('should reject if failed to create domain in James', function(done) {
      var error = new Error('something wrong');

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

  describe('The getUserQuota function', function() {
    it('should reject if failed to get user quota', function(done) {
      var error = new Error('something wrong');

      jamesClientInstanceMock.getUserQuota = sinon.stub().returns($q.reject(error));

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

  describe('The listMailRepositories function', function() {
    it('should reject if failed to list mail repositories', function(done) {
      jamesClientInstanceMock.mailRepositories = {
        list: sinon.stub().returns($q.reject())
      };

      jamesWebadminClient.listMailRepositories()
        .catch(function() {
          expect(jamesClientInstanceMock.mailRepositories.list).to.have.been.called;
          done();
        });

      $rootScope.$digest();
    });

    it('should resolve if listed email repositories successfully', function() {
      jamesClientInstanceMock.mailRepositories = {
        list: sinon.stub().returns($q.when([]))
      };

      jamesWebadminClient.listMailRepositories();

      $rootScope.$digest();

      expect(jamesClientInstanceMock.mailRepositories.list).to.have.been.called;
    });
  });

  describe('The listMailsInMailRepository function', function() {
    it('should reject if failed to list mails in a mail repository', function(done) {
      jamesClientInstanceMock.mailRepositories = {
        getMails: sinon.stub().returns($q.reject())
      };

      jamesWebadminClient.listMailsInMailRepository(REPOSITORY_ID)
        .catch(function() {
          expect(jamesClientInstanceMock.mailRepositories.getMails).to.have.been.calledWith(REPOSITORY_ID);
          done();
        });

      $rootScope.$digest();
    });

    it('should resolve if listed mail in a mail repository successfully', function() {
      jamesClientInstanceMock.mailRepositories = {
        getMails: sinon.stub().returns($q.when([]))
      };

      jamesWebadminClient.listMailsInMailRepository(REPOSITORY_ID);

      $rootScope.$digest();

      expect(jamesClientInstanceMock.mailRepositories.getMails).to.have.been.calledWith(REPOSITORY_ID);
    });
  });

  describe('The getMailInMailRepository function', function() {
    it('should reject if failed to get mail details in a mail repository', function(done) {
      var mailKey = 'mail-key-1';

      jamesClientInstanceMock.mailRepositories = {
        getMail: sinon.stub().returns($q.reject())
      };

      jamesWebadminClient.getMailInMailRepository(REPOSITORY_ID, mailKey)
        .catch(function() {
          expect(jamesClientInstanceMock.mailRepositories.getMail).to.have.been.calledWith(REPOSITORY_ID, mailKey);
          done();
        });

      $rootScope.$digest();
    });

    it('should resolve if gotten mail detail in a mail repository successfully', function() {
      var mailKey = 'mail-key-1';

      jamesClientInstanceMock.mailRepositories = {
        getMail: sinon.stub().returns($q.when([]))
      };

      jamesWebadminClient.getMailInMailRepository(REPOSITORY_ID, mailKey);

      $rootScope.$digest();

      expect(jamesClientInstanceMock.mailRepositories.getMail).to.have.been.calledWith(REPOSITORY_ID, mailKey);
    });
  });

  describe('The downloadEmlFileFromMailRepository function', function() {
    it('should reject if failed download eml file', function(done) {
      var mailKey = 'mail-key-1';

      FileSaver.saveAs = sinon.spy();
      jamesClientInstanceMock.mailRepositories = {
        downloadEmlFile: sinon.stub().returns($q.reject())
      };

      jamesWebadminClient.downloadEmlFileFromMailRepository(REPOSITORY_ID, mailKey)
        .catch(function() {
          expect(jamesClientInstanceMock.mailRepositories.downloadEmlFile).to.have.been.calledWith(REPOSITORY_ID, mailKey);
          expect(FileSaver.saveAs).to.not.have.been.called;
          done();
        });

      $rootScope.$digest();
    });

    it('should call FileSaver with the retrieved blob object', function() {
      var mailKey = 'mail-key-1';
      var blob = new Blob();

      FileSaver.saveAs = sinon.stub().returns(blob);
      jamesClientInstanceMock.mailRepositories = {
        downloadEmlFile: sinon.stub().returns($q.when(blob))
      };

      jamesWebadminClient.downloadEmlFileFromMailRepository(REPOSITORY_ID, mailKey);

      $rootScope.$digest();

      expect(jamesClientInstanceMock.mailRepositories.downloadEmlFile).to.have.been.calledWith(REPOSITORY_ID, mailKey);
      expect(FileSaver.saveAs).to.have.been.calledWith(blob, 'mail-key-1.eml');
    });
  });

  describe('The listDlpRules function', function() {
    beforeEach(function() {
      esnConfigMock = $q.when(serverUrl);
    });

    it('should reject if failed to list rules', function(done) {
      jamesClientInstanceMock.dlpRules = {
        list: sinon.stub().returns($q.reject())
      };

      jamesWebadminClient.listDlpRules(domain.name)
        .catch(function() {
          expect(jamesClientInstanceMock.dlpRules.list).to.have.been.calledWith(domain.name);
          done();
        });

      $rootScope.$digest();
    });

    it('should resolve on success to list rules', function(done) {
      var rules = [{
        id: '1',
        expression: 'abc',
        explanation: 'Anything contains abcs',
        targetsSender: false,
        targetsRecipients: false,
        targetsContent: true
      }];

      jamesClientInstanceMock.dlpRules = {
        list: sinon.stub().returns($q.when({ rules: rules }))
      };

      jamesWebadminClient.listDlpRules(domain.name)
        .then(function(_rules_) {
          expect(_rules_).to.deep.equal(rules);
          expect(jamesClientInstanceMock.dlpRules.list).to.have.been.calledWith(domain.name);
          done();
        });

      $rootScope.$digest();
    });
  });

  describe('The storeDlpRules function', function() {
    it('should reject if failed to store rules', function(done) {
      var rules = [{
        id: '1',
        expression: 'abc',
        explanation: 'Anything contains abcs',
        targetsSender: false,
        targetsRecipients: false,
        targetsContent: true
      }];

      jamesClientInstanceMock.dlpRules = {
        store: sinon.stub().returns($q.reject())
      };

      jamesWebadminClient.storeDlpRules(domain.name, rules)
        .catch(function() {
          expect(jamesClientInstanceMock.dlpRules.store).to.have.been.calledWith(domain.name, { rules: rules });
          done();
        });

      $rootScope.$digest();
    });

    it('should resolve on success to store rules', function(done) {
      var rules = [{
        id: '1',
        expression: 'abc',
        explanation: 'Anything contains abcs',
        targetsSender: false,
        targetsRecipients: false,
        targetsContent: true
      }];

      jamesClientInstanceMock.dlpRules = {
        store: sinon.stub().returns($q.when())
      };

      jamesWebadminClient.storeDlpRules(domain.name, rules)
        .then(function() {
          expect(jamesClientInstanceMock.dlpRules.store).to.have.been.calledWith(domain.name, { rules: rules });
          done();
        });

      $rootScope.$digest();
    });
  });

  describe('The removeDlpRules function', function() {
    it('should reject if failed to remove rules', function(done) {
      jamesClientInstanceMock.dlpRules = {
        remove: sinon.stub().returns($q.reject())
      };

      jamesWebadminClient.removeDlpRules(domain.name)
        .catch(function() {
          expect(jamesClientInstanceMock.dlpRules.remove).to.have.been.calledWith(domain.name);
          done();
        });

      $rootScope.$digest();
    });

    it('should resolve on success to remove rules', function(done) {
      jamesClientInstanceMock.dlpRules = {
        remove: sinon.stub().returns($q.when())
      };

      jamesWebadminClient.removeDlpRules(domain.name)
        .then(function() {
          expect(jamesClientInstanceMock.dlpRules.remove).to.have.been.calledWith(domain.name);
          done();
        });

      $rootScope.$digest();
    });
  });

  describe('The deleteMailInMailRepository function', function() {
    it('should reject if failed to delete a mail in mail repository', function(done) {
      jamesClientInstanceMock.mailRepositories = {
        removeMail: sinon.stub().returns($q.reject())
      };

      jamesWebadminClient.deleteMailInMailRepository('var/mail/sample', 'mail-key1')
        .then(function() {
          done(new Error('should not resolve'));
        })
        .catch(function() {
          expect(jamesClientInstanceMock.mailRepositories.removeMail).to.have.been.calledWith('var/mail/sample', 'mail-key1');
          done();
        });

      $rootScope.$digest();
    });

    it('should resolve on success todelete a mail in mail repository', function(done) {
      jamesClientInstanceMock.mailRepositories = {
        removeMail: sinon.stub().returns($q.when())
      };

      jamesWebadminClient.deleteMailInMailRepository('var/mail/sample', 'mail-key1')
        .then(function() {
          expect(jamesClientInstanceMock.mailRepositories.removeMail).to.have.been.calledWith('var/mail/sample', 'mail-key1');
          done();
        });

      $rootScope.$digest();
    });
  });

  describe('The deleteAllMailsInMailRepository function', function() {
    it('should reject if failed to delete all mails in mail repository', function(done) {
      jamesClientInstanceMock.mailRepositories = {
        removeAllMails: sinon.stub().returns($q.reject())
      };

      jamesWebadminClient.deleteAllMailsInMailRepository('var/mail/sample')
        .then(function() {
          done(new Error('should not resolve'));
        })
        .catch(function() {
          expect(jamesClientInstanceMock.mailRepositories.removeAllMails).to.have.been.calledWith('var/mail/sample');
          done();
        });

      $rootScope.$digest();
    });

    it('should resolve on success to delete all mails in mail repository', function(done) {
      jamesClientInstanceMock.mailRepositories = {
        removeAllMails: sinon.stub().returns($q.when())
      };

      jamesWebadminClient.deleteAllMailsInMailRepository('var/mail/sample')
        .then(function() {
          expect(jamesClientInstanceMock.mailRepositories.removeAllMails).to.have.been.calledWith('var/mail/sample');
          done();
        });

      $rootScope.$digest();
    });
  });

  describe('The reprocessAllMailsFromMailRepository function', function() {
    it('should reject if failed to reprocess all mails from a mail repository', function(done) {
      var options = {
        processor: 'processor'
      };

      jamesClientInstanceMock.mailRepositories = {
        reprocessAllMails: sinon.stub().returns($q.reject())
      };

      jamesWebadminClient.reprocessAllMailsFromMailRepository(REPOSITORY_ID, options)
        .catch(function() {
          expect(jamesClientInstanceMock.mailRepositories.reprocessAllMails).to.have.been.calledWith(REPOSITORY_ID, options);
          done();
        });

      $rootScope.$digest();
    });

    it('should resolve on success to reprocess all mails from a mail repository', function(done) {
      var options = {
        processor: 'processor'
      };

      jamesClientInstanceMock.mailRepositories = {
        reprocessAllMails: sinon.stub().returns($q.when())
      };

      jamesWebadminClient.reprocessAllMailsFromMailRepository(REPOSITORY_ID, options)
        .then(function() {
          expect(jamesClientInstanceMock.mailRepositories.reprocessAllMails).to.have.been.calledWith(REPOSITORY_ID, options);
          done();
        });

      $rootScope.$digest();
    });
  });

  describe('The reprocessMailFromMailRepository function', function() {
    it('should reject if failed to reprocess a specific mail from a mail repository', function(done) {
      var options = {
        processor: 'processor'
      };
      var mailKey = '123';

      jamesClientInstanceMock.mailRepositories = {
        reprocessMail: sinon.stub().returns($q.reject())
      };

      jamesWebadminClient.reprocessMailFromMailRepository(REPOSITORY_ID, mailKey, options)
        .catch(function() {
          expect(jamesClientInstanceMock.mailRepositories.reprocessMail).to.have.been.calledWith(REPOSITORY_ID, mailKey, options);
          done();
        });

      $rootScope.$digest();
    });

    it('should resolve on success to reprocess a specific mail from a mail repository', function(done) {
      var options = {
        processor: 'processor'
      };
      var mailKey = '123';

      jamesClientInstanceMock.mailRepositories = {
        reprocessMail: sinon.stub().returns($q.when())
      };

      jamesWebadminClient.reprocessMailFromMailRepository(REPOSITORY_ID, mailKey, options)
        .then(function() {
          expect(jamesClientInstanceMock.mailRepositories.reprocessMail).to.have.been.calledWith(REPOSITORY_ID, mailKey, options);
          done();
        });

      $rootScope.$digest();
    });
  });

  describe('The getDlpRule function', function() {
    it('should reject if failed to get a specific DLP rule', function(done) {
      var ruleId = '123';

      jamesClientInstanceMock.dlpRules = {
        get: sinon.stub().returns($q.reject())
      };

      jamesWebadminClient.getDlpRule(domain.name, ruleId)
        .catch(function() {
          expect(jamesClientInstanceMock.dlpRules.get).to.have.been.calledWith(domain.name, ruleId);
          done();
        });

      $rootScope.$digest();
    });

    it('should resolve on success to get a specific DLP rule', function(done) {
      var ruleId = '123';

      jamesClientInstanceMock.dlpRules = {
        get: sinon.stub().returns($q.when())
      };

      jamesWebadminClient.getDlpRule(domain.name, ruleId)
        .then(function() {
          expect(jamesClientInstanceMock.dlpRules.get).to.have.been.calledWith(domain.name, ruleId);
          done();
        });

      $rootScope.$digest();
    });
  });
});
