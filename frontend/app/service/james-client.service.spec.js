'use strict';

/* global chai: false */
/* global sinon: false */

var expect = chai.expect;

describe('The james services', function() {
  beforeEach(function() {
    module('linagora.esn.james');
  });

  describe('The jamesClientTransport factory', function() {
    var $httpBackend, jamesClientTransport;

    beforeEach(inject(function(_$httpBackend_, _jamesClientTransport_) {
      $httpBackend = _$httpBackend_;
      jamesClientTransport = _jamesClientTransport_;
    }));

    describe('The get fn', function() {
      it('should GET on the given URL, passing the given headers', function(done) {
        $httpBackend.expectGET('/testing', function(headers) {
          expect(headers).to.shallowDeepEqual({ a: 'x', b: 1 });

          return true;
        }).respond(200);

        jamesClientTransport.get('/testing', { a: 'x', b: 1 }).then(function() { done(); });

        $httpBackend.flush();
      });

      it('should parse the data as JSON and resolve the promise with it', function(done) {
        $httpBackend.expectGET('/testing').respond(200, '[["test",{"a":"b"}]]');

        jamesClientTransport.get('/testing').then(function(data) {
          expect(data).to.deep.equal([['test', { a: 'b' }]]);

          done();
        });

        $httpBackend.flush();
      });

      it('should reject the promise if HTTP status code is not 200', function(done) {
        $httpBackend.expectGET('/testing').respond(400);

        jamesClientTransport.get('/testing').catch(function() { done(); });

        $httpBackend.flush();
      });
    });

    describe('The put fn', function() {
      it('should PUT on the given URL, passing the given headers and serialize data as JSON', function(done) {
        $httpBackend.expectPUT('/testing', function(data) {
          expect(data).to.deep.equal('[0,1]');

          return true;
        }, function(headers) {
          expect(headers).to.shallowDeepEqual({ a: 'x', b: 1 });

          return true;
        }).respond(200);

        jamesClientTransport.put('/testing', { a: 'x', b: 1 }, [0, 1]).then(function() { done(); });

        $httpBackend.flush();
      });

      it('should parse the data as JSON and resolve the promise with it', function(done) {
        $httpBackend.expectPUT('/testing').respond(200, '[["test",{"a":"b"}]]');

        jamesClientTransport.put('/testing').then(function(data) {
          expect(data).to.deep.equal([['test', { a: 'b' }]]);

          done();
        });

        $httpBackend.flush();
      });

      it('should reject the promise if HTTP status code is not 200', function(done) {
        $httpBackend.expectPUT('/testing').respond(400);

        jamesClientTransport.put('/testing').catch(function() { done(); });

        $httpBackend.flush();
      });
    });
  });

  describe('The jamesClientProvider factory', function() {
    var $q, $rootScope, jamesApiClient, jamesClientProvider;
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

      angular.mock.module(function($provide) {
        $provide.value('$window', $windowMock);
        $provide.value('jamesRestangular', angular.noop);
      });

      inject(function(_$q_, _$rootScope_, _jamesApiClient_, _jamesClientProvider_) {
        $q = _$q_;
        $rootScope = _$rootScope_;
        jamesApiClient = _jamesApiClient_;
        jamesClientProvider = _jamesClientProvider_;
      });
    });

    describe('The get fn', function() {
      it('should return an instance of james client', function(done) {
        jamesApiClient.generateJwtToken = sinon.stub().returns($q.when({data: 'token'}));
        jamesClientProvider.get()
          .then(function(jamesClient) {
            expect(jamesApiClient.generateJwtToken).to.have.been.calledOnce;
            expect(jamesClient).to.deep.equal(jamesClientInstanceMock);
            done();
          });

        $rootScope.$digest();
      });

      it('should not call jamesApiClient.generateJwtToken if token is already cached', function(done) {
        jamesApiClient.generateJwtToken = sinon.stub().returns($q.when({data: 'token'}));
        jamesClientProvider.get()
          .then(function() {
            jamesClientProvider.get().then(function() {
              expect(jamesApiClient.generateJwtToken).to.have.been.calledOnce;
              done();
            });
          });

        $rootScope.$digest();
      });
    });
  });
});
