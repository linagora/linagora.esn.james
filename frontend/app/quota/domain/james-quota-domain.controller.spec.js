'use strict';

/* global chai, sinon: false */

var expect = chai.expect;

describe('The JamesQuotaDomainController', function() {

  var $controller, $rootScope, $scope, $q;
  var jamesWebadminClient, jamesQuotaHelpers;

  beforeEach(function() {
    module('linagora.esn.james');

    inject(function(
      _$controller_,
      _$rootScope_,
      _$q_,
      _jamesWebadminClient_,
      _jamesQuotaHelpers_
    ) {
      $controller = _$controller_;
      $rootScope = _$rootScope_;
      $q = _$q_;
      jamesWebadminClient = _jamesWebadminClient_;
      jamesQuotaHelpers = _jamesQuotaHelpers_;

      jamesQuotaHelpers.qualifyGet = function(quota) { return quota; };
      jamesQuotaHelpers.qualifySet = function(quota) { return quota; };
    });
  });

  function initController(scope) {
    $scope = scope || $rootScope.$new();

    var controller = $controller('JamesQuotaDomainController', { $scope: $scope });

    $scope.$digest();

    return controller;
  }

  describe('The getDomainQuota function', function() {
    it('should set the status to loading while attempting to get domain quota ', function() {
      var domain = { name: 'abc' };
      var controller = initController();

      jamesWebadminClient.getDomainQuota = function() {
        return $q.defer().promise;
      };

      controller.domain = domain;
      controller.getDomainQuota();

      expect(controller.status).to.equal('loading');
    });

    it('should set the status to error in case of failed attempt to get domain quota', function() {
      var domain = { name: 'abc' };
      var controller = initController();

      controller.domain = domain;
      jamesWebadminClient.getDomainQuota = sinon.stub().returns($q.reject());

      controller.getDomainQuota();
      $rootScope.$digest();

      expect(jamesWebadminClient.getDomainQuota).to.have.been.calledWith(domain.name);
      expect(controller.status).to.equal('error');
    });

    it('should set the status to loaded if succeed to get domain quota', function() {
      var domain = { name: 'abc' };
      var quota = { count: 16, size: 21 };
      var controller = initController();

      controller.domain = domain;
      jamesWebadminClient.getDomainQuota = sinon.stub().returns($q.when(quota));

      controller.getDomainQuota();
      $rootScope.$digest();

      expect(jamesWebadminClient.getDomainQuota).to.have.been.calledWith(domain.name);
      expect(controller.status).to.equal('loaded');
      expect(controller.quota).to.deep.equal(quota);
    });

    it('should qualify quota when succeed to get domain quota', function() {
      var domain = { name: 'abc' };
      var quota = { count: 16, size: 21 };
      var qualifiedQuota = { foo: 'bar' };
      var controller = initController();

      controller.domain = domain;
      jamesWebadminClient.getDomainQuota = function() {
        return $q.when(quota);
      };
      jamesQuotaHelpers.qualifyGet = sinon.stub().returns(qualifiedQuota);

      controller.getDomainQuota();
      $rootScope.$digest();

      expect(jamesQuotaHelpers.qualifyGet).to.have.been.calledWith(quota);
      expect(controller.quota).to.deep.equal(qualifiedQuota);
    });
  });

  describe('The updateDomainQuota function', function() {
    it('should reject if failed to update domain quota', function(done) {
      var domain = { name: 'abc' };
      var quota = { count: 16, size: 21 };

      jamesWebadminClient.setDomainQuota = sinon.stub().returns($q.reject());

      var controller = initController();

      controller.domain = domain;
      controller.quota = quota;
      controller.updateDomainQuota()
        .catch(function() {
          expect(jamesWebadminClient.setDomainQuota).to.have.been.calledWith(domain.name, controller.quota);
          done();
        });

      $rootScope.$digest();
    });

    it('should qualify quota before set domain quota', function() {
      var domain = { name: 'abc' };
      var quota = { count: 16, size: 21 };
      var qualifiedQuota = { foo: 'bar' };
      var controller = initController();

      controller.domain = domain;
      controller.quota = quota;
      jamesWebadminClient.setDomainQuota = sinon.stub().returns($q.when());
      jamesQuotaHelpers.qualifySet = sinon.stub().returns(qualifiedQuota);

      controller.updateDomainQuota();
      $rootScope.$digest();

      expect(jamesQuotaHelpers.qualifySet).to.have.been.calledWith(quota);
      expect(jamesWebadminClient.setDomainQuota).to.have.been.calledWith(domain.name, qualifiedQuota);
    });

    it('should resolve if succeed to update domain quota', function(done) {
      var domain = { name: 'abc' };
      var quota = { count: 16, size: 21 };

      jamesWebadminClient.setDomainQuota = sinon.stub().returns($q.when());

      var controller = initController();

      controller.domain = domain;
      controller.quota = quota;
      controller.updateDomainQuota()
        .then(function() {
          expect(jamesWebadminClient.setDomainQuota).to.have.been.calledWith(domain.name, controller.quota);
          done();
        })
        .catch(done);

      $rootScope.$digest();
    });
  });
});
