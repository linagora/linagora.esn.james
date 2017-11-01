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
});
