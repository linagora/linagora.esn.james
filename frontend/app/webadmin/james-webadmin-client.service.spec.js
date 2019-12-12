'use strict';

/* global chai: false */
/* global sinon: false */

var expect = chai.expect;

describe('The jamesWebadminClient', function() {

  var $rootScope, $q;
  var $windowMock, jamesClientInstanceMock;
  var jamesWebadminClient, jamesWebadminClientProvider, esnConfigMock, FileSaver;
  var domain, serverUrl;
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
      jamesWebadminClientProvider.get = sinon.stub().returns($q.when(jamesClientInstanceMock));
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
