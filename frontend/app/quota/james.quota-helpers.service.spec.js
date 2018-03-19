'use strict';

/* global chai: false */

var expect = chai.expect;

describe('The jamesQuotaHelpers service', function() {
  var jamesQuotaHelpers;

  beforeEach(function() {
    angular.mock.module('linagora.esn.james');

    inject(function(_jamesQuotaHelpers_) {
      jamesQuotaHelpers = _jamesQuotaHelpers_;
    });
  });

  describe('The qualifyGet function', function() {
    it('should return qualified quota settings in case of invalid(negative) quota count', function() {
      var invalid = {
        count: -1,
        size: -1
      };

      expect(jamesQuotaHelpers.qualifyGet(invalid)).to.deep.equal({
        count: null,
        size: null
      });
    });

    it('should return valid quota', function() {
      var valid = {
        count: 12,
        size: 34
      };

      expect(jamesQuotaHelpers.qualifyGet(valid)).to.deep.equal(valid);
    });
  });

  describe('The qualifySet function', function() {
    it('should return null values in case of invalid(negative) quota count', function() {
      var invalid = {
        count: -23,
        size: -11
      };

      expect(jamesQuotaHelpers.qualifySet(invalid)).to.deep.equal({
        count: -1,
        size: -1
      });
    });

    it('should return valid quota', function() {
      var valid = {
        count: 12,
        size: 34
      };

      expect(jamesQuotaHelpers.qualifySet(valid)).to.deep.equal(valid);
    });
  });
});
