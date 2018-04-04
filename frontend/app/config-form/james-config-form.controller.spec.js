'use strict';

/* global chai: false */
/* global sinon: false */

var expect = chai.expect;

describe('The jamesConfigFormController', function() {

  var $controller, $rootScope, $scope, $q;
  var session, jamesWebadminClientProvider;
  var $windowMock, jamesClientInstanceMock;

  beforeEach(function() {
    module('linagora.esn.james');

    jamesClientInstanceMock = {
      getQuota: function() { return $q.when({}); },
      setQuota: function() { return $q.when(); }
    };

    $windowMock = {
      james: {
        Client: function() {
          return jamesClientInstanceMock;
        }
      }
    };

    angular.mock.module(function($provide) {
      $provide.value('$window', $windowMock);
    });

    inject(function(
      _$controller_,
      _$rootScope_,
      _$q_,
      _session_,
      _jamesWebadminClientProvider_
    ) {
      $controller = _$controller_;
      $rootScope = _$rootScope_;
      $q = _$q_;
      session = _session_;
      jamesWebadminClientProvider = _jamesWebadminClientProvider_;

      jamesWebadminClientProvider.get = sinon.stub().returns($q.when(jamesClientInstanceMock));
    });
  });

  function initController(scope) {
    $scope = scope || $rootScope.$new();

    var controller = $controller('jamesConfigFormController', { $scope: $scope });

    controller.availableModes = {
      domain: 'domain',
      platform: 'platform'
    };

    controller.adminModulesDisplayerController = {
      registerPostSaveHandler: sinon.spy()
    };

    controller.configurations = {
      webadminApiFrontend: { value: 'http://james.webadmin.api' }
    };

    $scope.$digest();

    return controller;
  }

  describe('The $onInit fn', function() {
    it('should register post save handler', function() {
      var controller = initController();

      controller.$onInit();

      expect(controller.adminModulesDisplayerController.registerPostSaveHandler)
        .to.have.been.calledWith(sinon.match.func);
    });

    it('should try to connect when the webadminApiFrontend is defined', function() {
      var controller = initController();

      controller.$onInit();

      expect(controller.connectionStatus).to.equal('connecting');
    });

    it('should not try to connect when the webadminApiFrontend is not defined', function() {
      var controller = initController();

      controller.configurations.webadminApiFrontend.value = null;
      controller.$onInit();

      expect(controller.connectionStatus).to.be.undefined;
    });
  });

  describe('The post save handler (_saveJamesConfigurations fn)', function() {
    var postSaveHandler;
    var controller;

    beforeEach(function() {
      controller = initController();
      controller.adminModulesDisplayerController.registerPostSaveHandler = function(handler) {
        postSaveHandler = handler;
      };
      controller.$onInit();

      $rootScope.$digest();
    });

    it('should do nothing and resolve if the connection status is not "connected"', function(done) {
      jamesClientInstanceMock.setQuota = sinon.spy();
      jamesClientInstanceMock.setDomainQuota = sinon.spy();
      controller.connectionStatus = 'foo';

      postSaveHandler().then(function() {
        expect(jamesClientInstanceMock.setQuota).to.not.have.been.called;
        expect(jamesClientInstanceMock.setDomainQuota).to.not.have.been.called;
        done();
      });

      $rootScope.$digest();
    });

    it('should call James API to set platform quota', function(done) {
      controller.connectionStatus = 'connected';
      controller.config = { quota: { count: 10, size: 12 } };
      jamesClientInstanceMock.setQuota = sinon.spy();

      postSaveHandler().then(function() {
        expect(jamesClientInstanceMock.setQuota).to.have.been.calledWith(controller.config.quota);
        done();
      });

      $rootScope.$digest();
    });

    it('should call James API to set domain quota', function(done) {
      controller.connectionStatus = 'connected';
      controller.config = { quota: { count: 10, size: 12 } };
      controller.mode = 'domain';
      jamesClientInstanceMock.setDomainQuota = sinon.spy();

      postSaveHandler().then(function() {
        expect(jamesClientInstanceMock.setDomainQuota).to.have.been.calledWith(session.domain.name, controller.config.quota);
        done();
      });

      $rootScope.$digest();
    });

    it('should qualify quota configuration before saving', function(done) {
      controller.connectionStatus = 'connected';
      controller.config = { quota: { count: 0, size: -100 } };
      jamesClientInstanceMock.setQuota = sinon.spy();

      postSaveHandler().then(function() {
        expect(jamesClientInstanceMock.setQuota).to.have.been.calledWith({ count: -1, size: -1 });
        done();
      });

      $rootScope.$digest();
    });
  });

  describe('The onServerUrlChange fn', function() {
    var form;

    beforeEach(function() {
      form = { $setPristine: sinon.spy() };
    });

    it('should make the given form pristine', function() {
      var controller = initController();

      controller.onServerUrlChange(form);

      expect(form.$setPristine).to.have.been.calledOnce;
    });

    it('should reset config and try to connect', function() {
      var controller = initController();

      controller.onServerUrlChange(form);

      expect(controller.connectionStatus).to.equal('connecting');
      expect(controller.config).to.be.empty;
    });

    it('should call James API to get config and assign to controller on success', function() {
      var controller = initController();

      jamesClientInstanceMock.getQuota = sinon.stub().returns({ size: 11, count: 12 });
      controller.onServerUrlChange(form);

      $rootScope.$digest();

      expect(controller.config).to.deep.equal({ quota: { size: 11, count: 12 } });
      expect(controller.connectionStatus).to.equal('connected');
    });

    it('should call James API to get config of domain and assign to controller on success', function(done) {
      var controller = initController();

      controller.$onInit();

      controller.mode = 'domain';
      jamesClientInstanceMock.getDomainQuota = sinon.stub().returns({ size: 11, count: 12 });
      controller.onServerUrlChange(form);

      $rootScope.$digest();

      expect(controller.config).to.deep.equal({ quota: { size: 11, count: 12 } });
      expect(controller.connectionStatus).to.equal('connected');
      done();
    });

    it('should qualify quota configuration before assigning to controller', function() {
      var controller = initController();

      jamesClientInstanceMock.getQuota = sinon.stub().returns({ size: -11, count: -12 });
      controller.onServerUrlChange(form);

      $rootScope.$digest();

      expect(controller.config).to.deep.equal({ quota: { size: null, count: null } });
    });

    it('should set connectionStatus error on failure', function() {
      var controller = initController();

      jamesClientInstanceMock.getQuota = sinon.stub().returns($q.reject(new Error('an_error')));
      controller.onServerUrlChange(form);

      $rootScope.$digest();

      expect(controller.connectionStatus).to.equal('error');
    });
  });
});
