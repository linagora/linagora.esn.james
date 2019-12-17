const request = require('supertest');
const { expect } = require('chai');
const path = require('path');

describe('GET /dlp/domains/:uuid/rules/:ruleId API', () => {
  let app, helpers, deployOptions, adminUser, domainId, regularUser;
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

      adminUser = models.users[0];
      regularUser = models.users[1];
      domainId = models.domain._id;

      done();
    });
  });

  it('should respond 401 if not logged in', function(done) {
    helpers.api.requireLogin(app, 'get', '/james/api/dlp/domains/1/rules/1', done);
  });

  it('should respond 400 if the domain id is not an object Id', function(done) {
    helpers.api.loginAsUser(app, adminUser.emails[0], password, (err, requestAsMember) => {
      expect(err).to.not.exist;

      requestAsMember(request(app).get('/james/api/dlp/domains/1/rules/1'))
        .expect(400)
        .end((err, res) => {
          expect(err).to.not.exist;
          expect(res.body).to.deep.equal({
            error: {
              code: 400,
              message: 'Bad request',
              details: 'Invalid domain id'
            }
          });

          done();
        });
    });
  });

  it('should respond 404 if the given domain ID is not found', function(done) {
    helpers.api.loginAsUser(app, adminUser.emails[0], password, (err, requestAsMember) => {
      expect(err).to.not.exist;

      requestAsMember(request(app).get('/james/api/dlp/domains/507f1f77bcf86cd799439011/rules/1'))
        .expect(404)
        .end(err => {
          expect(err).to.not.exist;
          done();
        });
    });
  });

  it('should respond 403 if the user is not an admin domain', function(done) {
    helpers.api.loginAsUser(app, regularUser.emails[0], password, (err, requestAsMember) => {
      expect(err).to.not.exist;

      requestAsMember(request(app).get(`/james/api/dlp/domains/${domainId}/rules/1`))
        .expect(403)
        .end((err, res) => {
          expect(err).to.not.exist;
          expect(res.body.error.details).to.equal('User is not the domain manager');
          done();
        });
    });
  });
});
