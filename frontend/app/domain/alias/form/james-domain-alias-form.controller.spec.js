'use strict';

/* global chai, sinon: false */

var expect = chai.expect;

describe('The JamesDomainAliasFormController', function() {
  var $controller, $rootScope, $scope, $q;
  var jamesApiClient, domainAPI;

  beforeEach(function() {
    module('linagora.esn.james');

    inject(function(
      _$controller_,
      _$rootScope_,
      _$q_,
      _jamesApiClient_,
      _domainAPI_
    ) {
      $controller = _$controller_;
      $rootScope = _$rootScope_;
      $q = _$q_;
      jamesApiClient = _jamesApiClient_;
      domainAPI = _domainAPI_;
    });
  });

  function initController(scope) {
    $scope = scope || $rootScope.$new();

    var controller = $controller('JamesDomainAliasFormController', { $scope: $scope });

    $scope.$digest();

    controller.$onInit();

    return controller;
  }

  describe('The onAddBtnClick function', function() {
    it('should add the alias to the alias list if successful in adding alias from API', function() {
      var scope = $rootScope.$new();
      var domain = {
        name: 'abc',
        id: '123'
      };
      var aliases = ['open-paas.org'];
      var controller = initController(scope);

      jamesApiClient.addDomainAlias = sinon.stub().returns($q.when());

      controller.domain = domain;
      controller.aliases = aliases;
      controller.alias = 'linagora.com';

      controller.onAddBtnClick();
      scope.$digest();

      expect(jamesApiClient.addDomainAlias).to.have.been.calledWith(domain.id, 'linagora.com');
      expect(controller.aliases).to.deep.equal(['open-paas.org', 'linagora.com']);
    });

    it('should set the alias to empty string if successful in adding alias from API', function() {
      var scope = $rootScope.$new();
      var domain = {
        name: 'abc',
        id: '123'
      };
      var aliases = ['open-paas.org'];
      var controller = initController(scope);

      jamesApiClient.addDomainAlias = sinon.stub().returns($q.when());

      controller.domain = domain;
      controller.aliases = aliases;
      controller.alias = 'linagora.com';

      controller.onAddBtnClick();
      scope.$digest();

      expect(jamesApiClient.addDomainAlias).to.have.been.calledWith(domain.id, 'linagora.com');
      expect(controller.alias).to.equal('');
    });
  });

  describe('The checkAliasAvailability function', function() {
    it('should reject if there is no domain with the same name as the alias to be added', function(done) {
      var scope = $rootScope.$new();
      var domain = {
        name: 'abc',
        id: '123'
      };
      var aliases = ['open-paas.org'];
      var controller = initController(scope);

      domainAPI.getByName = sinon.stub().returns($q.when());

      controller.domain = domain;
      controller.aliases = aliases;
      controller.alias = 'linagora.com';

      controller.checkAliasAvailability(controller.alias)
        .catch(function(error) {
          expect(error.message).to.equal('Alias must be an existing domain');
          expect(domainAPI.getByName).to.have.been.calledWith('linagora.com');
          done();
        });

      scope.$digest();
    });

    it('should resolve if there is a domain with the same name as the alias to be added', function(done) {
      var scope = $rootScope.$new();
      var domain = {
        name: 'abc',
        id: '123'
      };
      var aliases = ['open-paas.org'];
      var controller = initController(scope);

      domainAPI.getByName = sinon.stub().returns($q.when({
        name: 'linagora.com'
      }));

      controller.domain = domain;
      controller.aliases = aliases;
      controller.alias = 'linagora.com';

      controller.checkAliasAvailability(controller.alias)
        .then(function() {
          expect(domainAPI.getByName).to.have.been.calledWith('linagora.com');
          done();
        });

      scope.$digest();
    });
  });

  describe('The aliasValidator function', function() {
    it('should return false if the alias to be added is the same with current domain name', function() {
      var scope = $rootScope.$new();
      var domain = {
        name: 'linagora.com',
        id: '123'
      };
      var aliases = ['open-paas.org'];
      var controller = initController(scope);

      domainAPI.getByName = sinon.stub().returns($q.when());

      controller.domain = domain;
      controller.aliases = aliases;
      controller.alias = 'linagora.com';

      expect(controller.aliasValidator(controller.alias)).to.be.false;
    });

    it('should return false if the alias to be added is already an alias of current domain', function() {
      var scope = $rootScope.$new();
      var domain = {
        name: 'linagora.com',
        id: '123'
      };
      var aliases = ['open-paas.org'];
      var controller = initController(scope);

      domainAPI.getByName = sinon.stub().returns($q.when());

      controller.domain = domain;
      controller.aliases = aliases;
      controller.alias = 'open-paas.org';

      expect(controller.aliasValidator(controller.alias)).to.be.false;
    });

    it('should return true if the alias to be added valid', function() {
      var scope = $rootScope.$new();
      var domain = {
        name: 'abc',
        id: '123'
      };
      var aliases = ['open-paas.org'];
      var controller = initController(scope);

      domainAPI.getByName = sinon.stub().returns($q.when());

      controller.domain = domain;
      controller.aliases = aliases;
      controller.alias = 'linagora.com';

      expect(controller.aliasValidator(controller.alias)).to.be.true;
    });
  });
});
