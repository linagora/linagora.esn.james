'use strict';

/* global chai: false */
/* global sinon: false */

var expect = chai.expect;

describe('The jamesQuotaUserController', function() {

  var $controller, $rootScope, $scope, $q;
  var jamesWebadminClient, jamesQuotaHelpers;

  beforeEach(function() {
    module('linagora.esn.james');
    module('esn.configuration', function($provide) {
      $provide.value('esnConfig', function() {
        return $q.when();
      });
    });

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

    var controller = $controller('jamesQuotaUserController', { $scope: $scope });

    $scope.$digest();

    return controller;
  }

  describe('The init function', function() {
    it('should resolve with gotten user quota then set the status to loaded', function(done) {
      var user = {
        emails: ['toto@tata.ti']
      };
      var quota = { count: 1, size: 1 };

      jamesWebadminClient.getUserQuota = sinon.stub().returns($q.when(quota));
      var controller = initController();

      controller.user = user;

      controller.init()
        .then(function() {
          expect(jamesWebadminClient.getUserQuota).to.have.been.calledWith(controller.user.emails[0]);
          expect(controller.status).to.equal('loaded');
          expect(controller.quota).to.deep.equal(quota);
          done();
        })
        .catch(done);

      $rootScope.$digest();
    });

    it('should set the status to error in case of failed attempt to get user quota', function(done) {
      var user = {
        emails: ['toto@tata.ti']
      };

      jamesWebadminClient.getUserQuota = sinon.stub().returns($q.reject());
      var controller = initController();

      controller.user = user;

      controller.init()
        .then(function() {
          expect(jamesWebadminClient.getUserQuota).to.have.been.calledWith(controller.user.emails[0]);
          expect(controller.status).to.equal('error');
          done();
        })
        .catch(done);

      $rootScope.$digest();
    });
  });

  describe('The updateUserQuota function', function() {
    it('should resolve after update user qupta', function(done) {
      var user = {
        emails: ['toto@tata.ti']
      };

      jamesWebadminClient.setUserQuota = sinon.stub().returns($q.when());

      var controller = initController();

      controller.user = user;
      controller.quota = { count: 23, size: 200 };
      controller.updateUserQuota()
        .then(function() {
          expect(jamesWebadminClient.setUserQuota).to.have.been.calledWith(controller.user.emails[0], controller.quota);
          done();
        })
        .catch(done);

      $rootScope.$digest();
    });
  });
});
