'use strict';

/* global chai: false */

var expect = chai.expect;

describe('The jamesQuotaHelpers service', function() {
  var jamesQuotaHelpers, JAMES_UNLIMITED_QUOTA;

  beforeEach(function() {
    angular.mock.module('linagora.esn.james');

    inject(function(_jamesQuotaHelpers_, _JAMES_UNLIMITED_QUOTA_) {
      jamesQuotaHelpers = _jamesQuotaHelpers_;
      JAMES_UNLIMITED_QUOTA = _JAMES_UNLIMITED_QUOTA_;
    });
  });

  describe('The qualifyGet function', function() {
    it('should return qualified quota settings in case of invalid quota count', function() {
      var invalid = {
        count: -10,
        size: -10
      };
      var invalid2 = null;

      expect(jamesQuotaHelpers.qualifyGet(invalid)).to.deep.equal({
        count: null,
        size: null
      });
      expect(jamesQuotaHelpers.qualifyGet(invalid2)).to.deep.equal({
        count: null,
        size: null
      });
    });

    it('should return valid quota', function() {
      var valid = {
        count: 12,
        size: 34
      };
      var valid2 = {
        count: JAMES_UNLIMITED_QUOTA,
        size: JAMES_UNLIMITED_QUOTA
      };

      expect(jamesQuotaHelpers.qualifyGet(valid)).to.deep.equal(valid);
      expect(jamesQuotaHelpers.qualifyGet(valid2)).to.deep.equal(valid2);
    });
  });

  describe('The qualifySet function', function() {
    it('should return null values in case of invalid quota count', function() {
      var invalid = {
        count: -23,
        size: -11
      };

      expect(jamesQuotaHelpers.qualifySet(invalid)).to.deep.equal({
        count: null,
        size: null
      });
    });

    it('should return valid quota', function() {
      var valid = {
        count: 12,
        size: 34
      };
      var valid2 = {
        count: JAMES_UNLIMITED_QUOTA,
        size: JAMES_UNLIMITED_QUOTA
      };

      expect(jamesQuotaHelpers.qualifySet(valid)).to.deep.equal(valid);
      expect(jamesQuotaHelpers.qualifySet(valid2)).to.deep.equal(valid2);
    });
  });
});
