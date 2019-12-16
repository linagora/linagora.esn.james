const request = require('supertest');
const { expect } = require('chai');
const path = require('path');
const { ObjectId } = require('bson');
const { MAIL_REPOSITORY_PATH_PREFIXES } = require('../../../../../../backend/webserver/api/domain/mail-repository/constants');

describe('DELETE /james/api/domains/:uuid/mailRepositories/:repository/mails API', () => {
  let app, helpers, deployOptions, adminUser, regularUser, domain;
  const password = 'secret';
  const repository = Object.keys(MAIL_REPOSITORY_PATH_PREFIXES)[0];

  beforeEach(function(done) {
    helpers = this.helpers;

    app = this.helpers.modules.current.app;
    deployOptions = {
      fixtures: path.normalize(`${__dirname}/../../../../fixtures/deployments`)
    };

    helpers.api.applyDomainDeployment('general', deployOptions, (err, models) => {
      if (err) {
        return done(err);
      }

      adminUser = models.users[0];
      regularUser = models.users[1];
      domain = models.domain;

      done();
    });
  });

  it('should respond 401 if not logged in', function(done) {
    helpers.api.requireLogin(app, 'delete', `/james/api/domains/${domain._id}/mailRepositories/${repository}/mails`, done);
  });

  it('should respond 404 if domain is not found', function(done) {
    const randomId = new ObjectId();

    helpers.api.loginAsUser(app, adminUser.emails[0], password, (err, requestAsMember) => {
      expect(err).to.not.exist;

      requestAsMember(request(app).delete(`/james/api/domains/${randomId}/mailRepositories/${repository}/mails`))
        .expect(404)
        .end(done);
    });
  });

  it('should respond 400 if the given repository is unsupported', function(done) {
    helpers.api.loginAsUser(app, adminUser.emails[0], password, (err, requestAsMember) => {
      expect(err).to.not.exist;

      requestAsMember(request(app).delete(`/james/api/domains/${domain._id}/mailRepositories/unsupportedRepository/mails`))
        .expect(400)
        .end((err, res) => {
          expect(err).to.not.exist;
          expect(res.body).to.deep.equal({
            error: {
              code: 400,
              message: 'Bad Request',
              details: `Invalid repository. Supported repositories: ${Object.keys(MAIL_REPOSITORY_PATH_PREFIXES).join(',')}`
            }
          });
          done();
        });
    });
  });

  it('should respond 403 if the requester is not a domain manager', function(done) {
    helpers.api.loginAsUser(app, regularUser.emails[0], password, (err, requestAsMember) => {
      expect(err).to.not.exist;

      requestAsMember(request(app).delete(`/james/api/domains/${domain._id}/mailRepositories/${repository}/mails`))
        .expect(403)
        .end((err, res) => {
          expect(err).to.not.exist;
          expect(res.body).to.deep.equal({
            error: {
              code: 403,
              message: 'Forbidden',
              details: 'User is not the domain manager'
            }
          });
          done();
        });
    });
  });
});
