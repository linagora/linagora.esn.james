const request = require('supertest');
const expect = require('chai').expect;
const path = require('path');

describe('GET /james/api/domains API', () => {
  let app, helpers, deployOptions, regularUser;
  const password = 'secret';

  beforeEach(function(done) {
    helpers = this.helpers;

    app = this.helpers.modules.current.app;
    deployOptions = {
      fixtures: path.normalize(`${__dirname}/../../../fixtures/deployments`)
    };

    helpers.api.applyDomainDeployment('general', deployOptions, (err, models) => {
      if (err) {
        return done(err);
      }
      regularUser = models.users[1];
      done();
    });
  });

  describe('GET /domains/:uuid/aliases', function() {
    it('should respond 401 if not logged in', function(done) {
      helpers.api.requireLogin(app, 'get', '/james/api/domains', done);
    });

    it('should respond 403 if the user is not platform admin', function(done) {
      helpers.api.loginAsUser(app, regularUser.emails[0], password, (err, requestAsMember) => {
        expect(err).to.not.exist;

        requestAsMember(request(app).get('/james/api/domains'))
          .expect(403)
          .end((err, res) => {
            expect(err).to.not.exist;
            expect(res.body.error.details).to.equal('To perform this action, you need to be a platformadmin');
            done();
          });
      });
    });
  });
});
