'use strict';

/* global chai: false */
/* global sinon: false */

var expect = chai.expect;

describe('The jamesWebadminClientProvider service', function() {
  var $q, $rootScope, jamesApiClient, jamesWebadminClientProvider;
  var $windowMock, jamesClientInstanceMock;

  beforeEach(function() {
    jamesClientInstanceMock = {};

    $windowMock = {
      james: {
        Client: function() {
          return jamesClientInstanceMock;
        }
      }
    };

    angular.mock.module('linagora.esn.james', function($provide) {
      $provide.value('$window', $windowMock);
      $provide.value('jamesRestangular', angular.noop);
    });

    inject(function(_$q_, _$rootScope_, _jamesApiClient_, _jamesWebadminClientProvider_) {
      $q = _$q_;
      $rootScope = _$rootScope_;
      jamesApiClient = _jamesApiClient_;
      jamesWebadminClientProvider = _jamesWebadminClientProvider_;
    });
  });

  describe('The get fn', function() {
    it('should return an instance of james client', function(done) {
      jamesApiClient.generateJwtToken = sinon.stub().returns($q.when({data: 'token'}));
      jamesWebadminClientProvider.get()
        .then(function(jamesClient) {
          expect(jamesApiClient.generateJwtToken).to.have.been.calledOnce;
          expect(jamesClient).to.deep.equal(jamesClientInstanceMock);
          done();
        });

      $rootScope.$digest();
    });

    it('should not call jamesApiClient.generateJwtToken if token is already cached', function(done) {
      jamesApiClient.generateJwtToken = sinon.stub().returns($q.when({data: 'token'}));
      jamesWebadminClientProvider.get()
        .then(function() {
          jamesWebadminClientProvider.get().then(function() {
            expect(jamesApiClient.generateJwtToken).to.have.been.calledOnce;
            done();
          });
        });

      $rootScope.$digest();
    });
  });
});
