const request = require('supertest');
const expect = require('chai').expect;
const path = require('path');

describe('/domain/:uuid/aliases API', () => {
  let app, helpers, deployOptions, domain, regularUser;
  let core;
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
      core = this.testEnv.core;
      domain = models.domain;
      done();
    });
  });

  describe('GET /domains/:uuid/aliases', function() {
    it('should respond 401 if not logged in', function(done) {
      helpers.api.requireLogin(app, 'get', `/james/api/domains/${domain.id}}/aliases`, done);
    });

    it('should respond 403 if the user is not platform admin', function(done) {
      helpers.api.loginAsUser(app, regularUser.emails[0], password, (err, requestAsMember) => {
        expect(err).to.not.exist;

        requestAsMember(request(app).get(`/james/api/domains/${domain.id}/aliases`))
          .expect(403)
          .end((err, res) => {
            expect(err).to.not.exist;
            expect(res.body.error.details).to.equal('To perform this action, you need to be a platformadmin');
            done();
          });
      });
    });

    it('should respond 400 if the domain id is not valid', function(done) {
      core.platformadmin
        .addPlatformAdmin(regularUser)
        .then(() => {
          const platformAdminUser = regularUser;

          helpers.api.loginAsUser(app, platformAdminUser.emails[0], password, (err, requestAsMember) => {
            expect(err).to.not.exist;

            requestAsMember(request(app).get('/james/api/domains/not_valid/aliases'))
            .expect(400)
            .end((err, res) => {
              expect(err).to.not.exist;
              expect(res.body.error.details).to.equal('Invalid domain id');
              done();
            });
          });
        })
        .catch(err => done(err || 'failed to add platformadmin'));
    });
  });

  describe('POST /domains/:uuid/aliases/:alias', function() {
    it('should respond 401 if not logged in', function(done) {
      helpers.api.requireLogin(app, 'post', `/james/api/domains/${domain.id}}/aliases/abc`, done);
    });

    it('should respond 403 if the user is not platform admin', function(done) {
      helpers.api.loginAsUser(app, regularUser.emails[0], password, (err, requestAsMember) => {
        expect(err).to.not.exist;

        requestAsMember(request(app).post(`/james/api/domains/${domain.id}/aliases/abc`))
          .expect(403)
          .end((err, res) => {
            expect(err).to.not.exist;
            expect(res.body.error.details).to.equal('To perform this action, you need to be a platformadmin');
            done();
          });
      });
    });

    it('should respond 400 if the domain id is not valid', function(done) {
      core.platformadmin
        .addPlatformAdmin(regularUser)
        .catch(err => done(err || 'failed to add platformadmin'))
        .then(() => {
          const platformAdminUser = regularUser;

          helpers.api.loginAsUser(app, platformAdminUser.emails[0], password, (err, requestAsMember) => {
            expect(err).to.not.exist;

            requestAsMember(request(app).post('/james/api/domains/not_valid/aliases/abc'))
              .expect(400)
              .end((err, res) => {
                expect(err).to.not.exist;
                expect(res.body.error.details).to.equal('Invalid domain id');
                done();
              });
          });
        });
    });

    it('should respond 400 if the alias is not an existing domain', function(done) {
      core.platformadmin
        .addPlatformAdmin(regularUser)
        .catch(err => done(err || 'failed to add platformadmin'))
        .then(() => {
          const platformAdminUser = regularUser;

          helpers.api.loginAsUser(app, platformAdminUser.emails[0], password, (err, requestAsMember) => {
            expect(err).to.not.exist;

            requestAsMember(request(app).post(`/james/api/domains/${domain.id}/aliases/not_a_domain`))
              .expect(400)
              .end((err, res) => {
                expect(err).to.not.exist;
                expect(res.body.error.details).to.equal('alias must be an existing domain');
                done();
              });
          });
        });
    });

    it('should respond 400 if domain and alias is the same', function(done) {
      core.platformadmin
        .addPlatformAdmin(regularUser)
        .catch(err => done(err || 'failed to add platformadmin'))
        .then(() => {
          const platformAdminUser = regularUser;

          helpers.api.loginAsUser(app, platformAdminUser.emails[0], password, (err, requestAsMember) => {
            expect(err).to.not.exist;

            requestAsMember(request(app).post(`/james/api/domains/${domain.id}/aliases/${domain.name}`))
              .expect(400)
              .end((err, res) => {
                expect(err).to.not.exist;
                expect(res.body.error.details).to.equal('domain and alias cannot be the same');
                done();
              });
          });
        });
    });
  });

  describe('DELETE /domains/:uuid/aliases', function() {
    it('should respond 401 if not logged in', function(done) {
      helpers.api.requireLogin(app, 'delete', `/james/api/domains/${domain.id}}/aliases/abc`, done);
    });

    it('should respond 403 if the user is not platform admin', function(done) {
      helpers.api.loginAsUser(app, regularUser.emails[0], password, (err, requestAsMember) => {
        expect(err).to.not.exist;

        requestAsMember(request(app).delete(`/james/api/domains/${domain.id}/aliases/abc`))
          .expect(403)
          .end((err, res) => {
            expect(err).to.not.exist;
            expect(res.body.error.details).to.equal('To perform this action, you need to be a platformadmin');
            done();
          });
      });
    });

    it('should respond 400 if the domain id is not valid', function(done) {
      core.platformadmin
        .addPlatformAdmin(regularUser)
        .catch(err => done(err || 'failed to add platformadmin'))
        .then(() => {
          const platformAdminUser = regularUser;

          helpers.api.loginAsUser(app, platformAdminUser.emails[0], password, (err, requestAsMember) => {
            expect(err).to.not.exist;

            requestAsMember(request(app).delete('/james/api/domains/not_valid/aliases/abc'))
              .expect(400)
              .end((err, res) => {
                expect(err).to.not.exist;
                expect(res.body.error.details).to.equal('Invalid domain id');
                done();
              });
          });
        });
    });

    it('should respond 400 if the alias is not an existing domain', function(done) {
      core.platformadmin
        .addPlatformAdmin(regularUser)
        .catch(err => done(err || 'failed to add platformadmin'))
        .then(() => {
          const platformAdminUser = regularUser;

          helpers.api.loginAsUser(app, platformAdminUser.emails[0], password, (err, requestAsMember) => {
            expect(err).to.not.exist;

            requestAsMember(request(app).delete(`/james/api/domains/${domain.id}/aliases/not_a_domain`))
              .expect(400)
              .end((err, res) => {
                expect(err).to.not.exist;
                expect(res.body.error.details).to.equal('alias must be an existing domain');
                done();
              });
          });
        });
    });

    it('should respond 400 if domain and alias is the same', function(done) {
      core.platformadmin
        .addPlatformAdmin(regularUser)
        .catch(err => done(err || 'failed to add platformadmin'))
        .then(() => {
          const platformAdminUser = regularUser;

          helpers.api.loginAsUser(app, platformAdminUser.emails[0], password, (err, requestAsMember) => {
            expect(err).to.not.exist;

            requestAsMember(request(app).delete(`/james/api/domains/${domain.id}/aliases/${domain.name}`))
              .expect(400)
              .end((err, res) => {
                expect(err).to.not.exist;
                expect(res.body.error.details).to.equal('domain and alias cannot be the same');
                done();
              });
          });
        });
    });
  });
});
