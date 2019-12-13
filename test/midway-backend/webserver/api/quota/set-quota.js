const request = require('supertest');
const { expect } = require('chai');
const path = require('path');
const { ObjectId } = require('bson');

describe('PUT /quota API', () => {
  let app, helpers, core, deployOptions, adminUser, regularUser, domain, quota;
  const password = 'secret';

  beforeEach(function(done) {
    helpers = this.helpers;
    quota = {
      size: 100,
      count: 100
    };

    app = this.helpers.modules.current.app;
    deployOptions = {
      fixtures: path.normalize(`${__dirname}/../../../fixtures/deployments`)
    };

    helpers.api.applyDomainDeployment('general', deployOptions, (err, models) => {
      if (err) {
        return done(err);
      }

      adminUser = models.users[0];
      regularUser = models.users[1];
      domain = models.domain;
      core = this.testEnv.core;

      done();
    });
  });

  it('should respond 401 if not logged in', function(done) {
    helpers.api.requireLogin(app, 'put', '/james/api/quota', done);
  });

  it('should respond 400 if there is no scope is provided', function(done) {
    helpers.api.loginAsUser(app, regularUser.emails[0], password, (err, requestAsMember) => {
      expect(err).to.not.exist;

      requestAsMember(request(app).put('/james/api/quota'))
        .send(quota)
        .expect(400)
        .end((err, res) => {
          expect(err).to.not.exist;
          expect(res.body).to.deep.equal({
            error: {
              code: 400,
              message: 'Bad Request',
              details: 'Query scope is required'
            }
          });
          done();
        });
    });
  });

  it('should respond 400 if the given scope is invalid', function(done) {
    helpers.api.loginAsUser(app, regularUser.emails[0], password, (err, requestAsMember) => {
      expect(err).to.not.exist;

      requestAsMember(request(app).put('/james/api/quota?scope=invalid'))
        .send(quota)
        .expect(400)
        .end((err, res) => {
          expect(err).to.not.exist;
          expect(res.body).to.deep.equal({
            error: {
              code: 400,
              message: 'Bad Request',
              details: 'Query scope is invalid. Available scopes are: platform, domain and user'
            }
          });
          done();
        });
    });
  });

  describe('when scope is platform', function() {
    it('should respond 400 if the given quota size is invalid', function(done) {
      quota.size = 'size';

      core.platformadmin
        .addPlatformAdmin(regularUser)
        .catch(err => done(err || 'failed to add platformadmin'))
        .then(() => {
          helpers.api.loginAsUser(app, regularUser.emails[0], password, (err, requestAsMember) => {
            expect(err).to.not.exist;

            requestAsMember(request(app).put('/james/api/quota?scope=platform'))
              .send(quota)
              .expect(400)
              .end((err, res) => {
                expect(err).to.not.exist;
                expect(res.body).to.deep.equal({
                  error: {
                    code: 400,
                    message: 'Bad Request',
                    details: 'Quota size or count is invalid. Valid values are: -1, null or non-negative integers'
                  }
                });
                done();
              });
          });
        });
    });

    it('should respond 400 if the given quota count is invalid', function(done) {
      quota.count = 'count';

      core.platformadmin
        .addPlatformAdmin(regularUser)
        .catch(err => done(err || 'failed to add platformadmin'))
        .then(() => {
          helpers.api.loginAsUser(app, regularUser.emails[0], password, (err, requestAsMember) => {
            expect(err).to.not.exist;

            requestAsMember(request(app).put('/james/api/quota?scope=platform'))
              .send(quota)
              .expect(400)
              .end((err, res) => {
                expect(err).to.not.exist;
                expect(res.body).to.deep.equal({
                  error: {
                    code: 400,
                    message: 'Bad Request',
                    details: 'Quota size or count is invalid. Valid values are: -1, null or non-negative integers'
                  }
                });
                done();
              });
          });
        });
    });

    it('should respond 403 if requester is a normal user', function(done) {
      helpers.api.loginAsUser(app, regularUser.emails[0], password, (err, requestAsMember) => {
        expect(err).to.not.exist;

        requestAsMember(request(app).put('/james/api/quota?scope=platform'))
          .send(quota)
          .expect(403)
          .end((err, res) => {
            expect(err).to.not.exist;
            expect(res.body).to.deep.equal({
              error: {
                code: 403,
                message: 'Forbidden',
                details: 'To perform this action, you need to be a platformadmin'
              }
            });
            done();
          });
      });
    });

    it('should respond 403 if requester is a domain admin', function(done) {
      helpers.api.loginAsUser(app, adminUser.emails[0], password, (err, requestAsMember) => {
        expect(err).to.not.exist;

        requestAsMember(request(app).put('/james/api/quota?scope=platform'))
          .send(quota)
          .expect(403)
          .end((err, res) => {
            expect(err).to.not.exist;
            expect(res.body).to.deep.equal({
              error: {
                code: 403,
                message: 'Forbidden',
                details: 'To perform this action, you need to be a platformadmin'
              }
            });
            done();
          });
      });
    });
  });

  describe('when scope is domain', function() {
    it('should respond 400 if there is no domain_id', function(done) {
      helpers.api.loginAsUser(app, adminUser.emails[0], password, (err, requestAsMember) => {
        expect(err).to.not.exist;

        requestAsMember(request(app).put('/james/api/quota?scope=domain'))
          .send(quota)
          .expect(400)
          .end((err, res) => {
            expect(err).to.not.exist;
            expect(res.body).to.deep.equal({
              error: {
                code: 400,
                message: 'Bad Request',
                details: 'Query domain_id is required for scope domain'
              }
            });
            done();
          });
      });
    });

    it('should respond 400 if the given quota size is invalid', function(done) {
      quota.size = 'size';

      helpers.api.loginAsUser(app, adminUser.emails[0], password, (err, requestAsMember) => {
        expect(err).to.not.exist;

        requestAsMember(request(app).put(`/james/api/quota?scope=domain&&domain_id=${domain._id}`))
          .send(quota)
          .expect(400)
          .end((err, res) => {
            expect(err).to.not.exist;
            expect(res.body).to.deep.equal({
              error: {
                code: 400,
                message: 'Bad Request',
                details: 'Quota size or count is invalid. Valid values are: -1, null or non-negative integers'
              }
            });
            done();
          });
      });
    });

    it('should respond 400 if the given quota count is invalid', function(done) {
      quota.count = 'count';

      helpers.api.loginAsUser(app, adminUser.emails[0], password, (err, requestAsMember) => {
        expect(err).to.not.exist;

        requestAsMember(request(app).put(`/james/api/quota?scope=domain&&domain_id=${domain._id}`))
          .send(quota)
          .expect(400)
          .end((err, res) => {
            expect(err).to.not.exist;
            expect(res.body).to.deep.equal({
              error: {
                code: 400,
                message: 'Bad Request',
                details: 'Quota size or count is invalid. Valid values are: -1, null or non-negative integers'
              }
            });
            done();
          });
      });
    });

    it('should respond 403 if requester is a normal user', function(done) {
      helpers.api.loginAsUser(app, regularUser.emails[0], password, (err, requestAsMember) => {
        expect(err).to.not.exist;

        requestAsMember(request(app).put(`/james/api/quota?scope=domain&&domain_id=${domain._id}`))
          .send(quota)
          .expect(403)
          .end((err, res) => {
            expect(err).to.not.exist;
            expect(res.body).to.deep.equal({
              error: {
                code: 403,
                message: 'Forbidden',
                details: 'The operation requires admin rights of the platform or the domain'
              }
            });
            done();
          });
      });
    });

    it('should respond 404 if the domain is not found', function(done) {
      const randomId = new ObjectId();

      helpers.api.loginAsUser(app, regularUser.emails[0], password, (err, requestAsMember) => {
        expect(err).to.not.exist;

        requestAsMember(request(app).put(`/james/api/quota?scope=domain&&domain_id=${randomId}`))
          .send(quota)
          .expect(404)
          .end((err, res) => {
            expect(err).to.not.exist;
            expect(res.body).to.deep.equal({
              error: {
                code: 404,
                message: 'Not found',
                details: `The domain ${randomId} could not be found`
              }
            });
            done();
          });
      });
    });
  });

  describe('when scope is user', function() {
    it('should respond 400 if there is no domain_id when scope is user', function(done) {
      helpers.api.loginAsUser(app, adminUser.emails[0], password, (err, requestAsMember) => {
        expect(err).to.not.exist;

        requestAsMember(request(app).put('/james/api/quota?scope=user'))
          .send(quota)
          .expect(400)
          .end((err, res) => {
            expect(err).to.not.exist;
            expect(res.body).to.deep.equal({
              error: {
                code: 400,
                message: 'Bad Request',
                details: 'Query domain_id is required for scope user'
              }
            });
            done();
          });
      });
    });

    it('should resond 400 if there is no user_id when scope is user', function(done) {
      helpers.api.loginAsUser(app, regularUser.emails[0], password, (err, requestAsMember) => {
        expect(err).to.not.exist;

        requestAsMember(request(app).put(`/james/api/quota?scope=user&&domain_id=${domain._id}`))
          .send(quota)
          .expect(400)
          .end((err, res) => {
            expect(err).to.not.exist;
            expect(res.body).to.deep.equal({
              error: {
                code: 400,
                message: 'Bad Request',
                details: 'Query user_id is required for scope user'
              }
            });
            done();
          });
      });
    });

    it('should respond 400 if the given quota size is invalid', function(done) {
      quota.size = 'size';

      helpers.api.loginAsUser(app, regularUser.emails[0], password, (err, requestAsMember) => {
        expect(err).to.not.exist;

        requestAsMember(request(app).put(`/james/api/quota?scope=user&&domain_id=${domain._id}&&user_id=${regularUser._id}`))
          .send(quota)
          .expect(400)
          .end((err, res) => {
            expect(err).to.not.exist;
            expect(res.body).to.deep.equal({
              error: {
                code: 400,
                message: 'Bad Request',
                details: 'Quota size or count is invalid. Valid values are: -1, null or non-negative integers'
              }
            });
            done();
          });
      });
    });

    it('should respond 400 if the given quota count is invalid', function(done) {
      quota.count = 'count';

      helpers.api.loginAsUser(app, adminUser.emails[0], password, (err, requestAsMember) => {
        expect(err).to.not.exist;

        requestAsMember(request(app).put(`/james/api/quota?scope=domain&&domain_id=${domain._id}&&user_id=${regularUser._id}`))
          .send(quota)
          .expect(400)
          .end((err, res) => {
            expect(err).to.not.exist;
            expect(res.body).to.deep.equal({
              error: {
                code: 400,
                message: 'Bad Request',
                details: 'Quota size or count is invalid. Valid values are: -1, null or non-negative integers'
              }
            });
            done();
          });
      });
    });

    it('should respond 403 if requester is a normal user', function(done) {
      helpers.api.loginAsUser(app, regularUser.emails[0], password, (err, requestAsMember) => {
        expect(err).to.not.exist;

        requestAsMember(request(app).put(`/james/api/quota?scope=user&&domain_id=${domain._id}&&user_id=${regularUser._id}`))
          .send(quota)
          .expect(403)
          .end((err, res) => {
            expect(err).to.not.exist;
            expect(res.body).to.deep.equal({
              error: {
                code: 403,
                message: 'Forbidden',
                details: 'The operation requires admin rights of the domain'
              }
            });
            done();
          });
      });
    });

    it('should respond 404 if the domain is not found', function(done) {
      const randomId = new ObjectId();

      helpers.api.loginAsUser(app, adminUser.emails[0], password, (err, requestAsMember) => {
        expect(err).to.not.exist;

        requestAsMember(request(app).put(`/james/api/quota?scope=user&&domain_id=${randomId}&&user_id=${regularUser._id}`))
          .send(quota)
          .expect(404)
          .end((err, res) => {
            expect(err).to.not.exist;
            expect(res.body).to.deep.equal({
              error: {
                code: 404,
                message: 'Not found',
                details: `The domain ${randomId} could not be found`
              }
            });
            done();
          });
      });
    });

    it('should respond 404 if the target user is not found', function(done) {
      const randomId = new ObjectId();

      helpers.api.loginAsUser(app, adminUser.emails[0], password, (err, requestAsMember) => {
        expect(err).to.not.exist;

        requestAsMember(request(app).put(`/james/api/quota?scope=user&&domain_id=${domain._id}&&user_id=${randomId}`))
          .send(quota)
          .expect(404)
          .end((err, res) => {
            expect(err).to.not.exist;
            expect(res.body).to.deep.equal({
              error: {
                code: 404,
                message: 'Not Found',
                details: 'Target user is not found'
              }
            });
            done();
          });
      });
    });
  });
});
