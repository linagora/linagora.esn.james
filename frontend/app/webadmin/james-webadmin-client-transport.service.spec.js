'use strict';

/* global chai: false */

var expect = chai.expect;

describe('The jamesWebadminClientTransport service', function() {
  var $httpBackend, jamesWebadminClientTransport;

  beforeEach(function() {
    module('linagora.esn.james');
  });

  beforeEach(inject(function(_$httpBackend_, _jamesWebadminClientTransport_) {
    $httpBackend = _$httpBackend_;
    jamesWebadminClientTransport = _jamesWebadminClientTransport_;
  }));

  describe('The get fn', function() {
    it('should GET on the given URL, passing the given headers', function(done) {
      $httpBackend.expectGET('/testing', function(headers) {
        expect(headers).to.shallowDeepEqual({ a: 'x', b: 1 });

        return true;
      }).respond(200);

      jamesWebadminClientTransport.get('/testing', { a: 'x', b: 1 }).then(function() { done(); });

      $httpBackend.flush();
    });

    it('should parse the data as JSON and resolve the promise with it', function(done) {
      $httpBackend.expectGET('/testing').respond(200, '[["test",{"a":"b"}]]');

      jamesWebadminClientTransport.get('/testing').then(function(data) {
        expect(data).to.deep.equal([['test', { a: 'b' }]]);

        done();
      });

      $httpBackend.flush();
    });

    it('should reject the promise if HTTP status code is not 200', function(done) {
      $httpBackend.expectGET('/testing').respond(400);

      jamesWebadminClientTransport.get('/testing').catch(function() { done(); });

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

      jamesWebadminClientTransport.put('/testing', { a: 'x', b: 1 }, [0, 1]).then(function() { done(); });

      $httpBackend.flush();
    });

    it('should parse the data as JSON and resolve the promise with it', function(done) {
      $httpBackend.expectPUT('/testing').respond(200, '[["test",{"a":"b"}]]');

      jamesWebadminClientTransport.put('/testing').then(function(data) {
        expect(data).to.deep.equal([['test', { a: 'b' }]]);

        done();
      });

      $httpBackend.flush();
    });

    it('should reject the promise if HTTP status code is not 200', function(done) {
      $httpBackend.expectPUT('/testing').respond(400);

      jamesWebadminClientTransport.put('/testing').catch(function() { done(); });

      $httpBackend.flush();
    });
  });
});
