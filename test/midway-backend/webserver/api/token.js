const request = require('supertest');
const expect = require('chai').expect;
const path = require('path');

describe('/token API', () => {
  let app, helpers, deployOptions, adminUser, regularUser;
  let core;
  const password = 'secret';

  beforeEach(function(done) {
    helpers = this.helpers;

    app = this.helpers.modules.current.app;
    deployOptions = {
      fixtures: path.normalize(`${__dirname}/../../fixtures/deployments`)
    };

    helpers.api.applyDomainDeployment('general', deployOptions, (err, models) => {
      if (err) {
        return done(err);
      }

      adminUser = models.users[0];
      regularUser = models.users[1];
      core = this.testEnv.core;

      done();
    });
  });

  describe('POST /token', function() {
    it('should respond 401 if not logged in', function(done) {
      helpers.api.requireLogin(app, 'post', '/james/api/token', done);
    });

    it('should respond 403 if the user is not platform admin or domain admin', function(done) {
      helpers.api.loginAsUser(app, regularUser.emails[0], password, (err, requestAsMember) => {
        expect(err).to.not.exist;

        requestAsMember(request(app).post('/james/api/token'))
          .expect(403)
          .end((err, res) => {
            expect(err).to.not.exist;
            expect(res.body.error.details).to.equal('User is not the domain manager');
            done();
          });
      });
    });

    it('should return 200 with JWT token if user is domain admin', function(done) {
      helpers.api.loginAsUser(app, adminUser.emails[0], password, (err, requestAsMember) => {
        expect(err).to.not.exist;

        requestAsMember(request(app).post('/james/api/token'))
          .expect(200)
          .end((err, res) => {
            expect(err).to.not.exist;
            expect(res.body).to.exist;
            done();
          });
      });
    });

    it('should respond 200 with JWT token if user is platform admin', function(done) {
      core.platformadmin
        .addPlatformAdmin(regularUser)
        .catch(err => done(err || 'failed to add platformadmin'))
        .then(() => {
          // now the regularUser became platform admin
          const platformAdminUser = regularUser;

          helpers.api.loginAsUser(app, platformAdminUser.emails[0], password, (err, requestAsMember) => {
            expect(err).to.not.exist;
            requestAsMember(request(app).post('/james/api/token'))
              .expect(200)
              .end((err, res) => {
                expect(err).to.not.exist;
                expect(res.body).to.exist;
                done();
              });
          });
        });
    });
  });
});
