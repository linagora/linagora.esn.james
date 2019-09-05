'use strict';

describe('The jamesApiClient service', function() {
  var $httpBackend;
  var jamesApiClient;

  beforeEach(function() {
    module('linagora.esn.james');

    inject(function(_$httpBackend_, _jamesApiClient_) {
      $httpBackend = _$httpBackend_;
      jamesApiClient = _jamesApiClient_;
    });
  });

  describe('The generateJwtToken fn', function() {
    it('should POST to the right endpoint to generate JWT token', function() {
      $httpBackend.expectPOST('/james/api/token').respond(200);

      jamesApiClient.generateJwtToken();

      $httpBackend.flush();
    });

    it('should POST to the right endpoint to generate JWT token (with domain ID)', function() {
      var domainId = '123';

      $httpBackend.expectPOST('/james/api/token?domain_id=' + domainId).respond(200);

      jamesApiClient.generateJwtToken(domainId);

      $httpBackend.flush();
    });
  });

  describe('The getGroupSyncStatus fn', function() {
    it('should GET to the right endpoint to get synchornization status of group', function() {
      var groupId = '123';

      $httpBackend.expectGET('/james/api/sync/groups/' + groupId).respond(200);

      jamesApiClient.getGroupSyncStatus(groupId);

      $httpBackend.flush();
    });
  });

  describe('The syncGroup fn', function() {
    it('should POST to the right endpoint to sync group', function() {
      var groupId = '123';

      $httpBackend.expectPOST('/james/api/sync/groups/' + groupId).respond(204);

      jamesApiClient.syncGroup(groupId);

      $httpBackend.flush();
    });
  });

  describe('The syncDomains fn', function() {
    it('should POST to the right endpoint to sync domains', function() {
      $httpBackend.expectPOST('/james/api/sync/domains').respond(204);

      jamesApiClient.syncDomains();

      $httpBackend.flush();
    });
  });

  describe('The getDomainsSyncStatus fn', function() {
    it('should GET to the right endpoint to get sync domains status', function() {
      $httpBackend.expectGET('/james/api/sync/domains').respond(200);

      jamesApiClient.getDomainsSyncStatus();

      $httpBackend.flush();
    });
  });

  describe('The getDomainAliases function', function() {
    it('should GET to the right endpoint to get the domain aliases', function() {
      var domainId = '123';

      $httpBackend.expectGET('/james/api/domains/' + domainId + '/aliases').respond(200);

      jamesApiClient.getDomainAliases(domainId);

      $httpBackend.flush();
    });
  });

  describe('The addDomainAlias function', function() {
    it('should POST to the right endpoint to add the domain alias', function() {
      var domainId = '123';
      var alias = 'open-paas.org';

      $httpBackend.expectPOST('/james/api/domains/' + domainId + '/aliases/' + alias).respond(204);

      jamesApiClient.addDomainAlias(domainId, alias);

      $httpBackend.flush();
    });
  });

  describe('The removeDomainAlias function', function() {
    it('should DELETE to the right endpoint to remove the domain alias', function() {
      var domainId = '123';
      var alias = 'open-paas.org';

      $httpBackend.expectDELETE('/james/api/domains/' + domainId + '/aliases/' + alias).respond(204);

      jamesApiClient.removeDomainAlias(domainId, alias);

      $httpBackend.flush();
    });
  });

  describe('The listJamesDomains function', function() {
    it('should send GET request to the right endpoint to list James domains', function() {
      $httpBackend.expectGET('/james/api/domains').respond(200);

      jamesApiClient.listJamesDomains();

      $httpBackend.flush();
    });
  });
});
