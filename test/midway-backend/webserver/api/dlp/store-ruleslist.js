const request = require('supertest');
const { expect } = require('chai');
const path = require('path');

describe('PUT /dlp/domains/:uuid/rules API', () => {
  let app, helpers, deployOptions, adminUser, domainId, regularUser, rules;
  const password = 'secret';

  beforeEach(function(done) {
    helpers = this.helpers;

    app = this.helpers.modules.current.app;
    deployOptions = {
      fixtures: path.normalize(`${__dirname}/../../../fixtures/deployments`)
    };

    rules = [
      {
        id: '0',
        expression: 'james.org',
        explanation: 'Find senders or recipients containing james[any char]org',
        targetsSender: true,
        targetsRecipients: true,
        targetsContent: false
      },
      {
        id: '1',
        expression: 'apache.org',
        explanation: 'Find senders containing apache[any char]org',
        targetsSender: true,
        targetsRecipients: false,
        targetsContent: false
    }];

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
    helpers.api.requireLogin(app, 'put', '/james/api/dlp/domains/1/rules', done);
  });

  it('should respond 400 if the domain id is not an object Id', function(done) {
    helpers.api.loginAsUser(app, adminUser.emails[0], password, (err, requestAsMember) => {
      expect(err).to.not.exist;

      requestAsMember(request(app).put('/james/api/dlp/domains/1/rules'))
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

      requestAsMember(request(app).put('/james/api/dlp/domains/507f1f77bcf86cd799439011/rules'))
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

      requestAsMember(request(app).put(`/james/api/dlp/domains/${domainId}/rules`))
        .expect(403)
        .end((err, res) => {
          expect(err).to.not.exist;
          expect(res.body.error.details).to.equal('User is not the domain manager');
          done();
        });
    });
  });

  it('should respond 400 if there are duplicated rule IDs', function(done) {
    rules[0].id = rules[1].id;

    helpers.api.loginAsUser(app, adminUser.emails[0], password, (err, requestAsMember) => {
      expect(err).to.not.exist;

      requestAsMember(request(app).put(`/james/api/dlp/domains/${domainId}/rules`).send(rules))
        .expect(400)
        .end((err, res) => {
          expect(err).to.not.exist;
          expect(res.body.error.details).to.equal('Id duplicates are not allowed in DLP rules');
          done();
        });
    });
  });

  it('should respond 400 if id is missing', function(done) {
    delete rules[0].id;

    helpers.api.loginAsUser(app, adminUser.emails[0], password, (err, requestAsMember) => {
      expect(err).to.not.exist;

      requestAsMember(request(app).put(`/james/api/dlp/domains/${domainId}/rules`).send(rules))
        .expect(400)
        .end((err, res) => {
          expect(err).to.not.exist;
          expect(res.body.error.details).to.contains('should have required property \'id\'');
          done();
        });
    });
  });

  it('should respond 400 if expression is missing', function(done) {
    delete rules[0].expression;

    helpers.api.loginAsUser(app, adminUser.emails[0], password, (err, requestAsMember) => {
      expect(err).to.not.exist;

      requestAsMember(request(app).put(`/james/api/dlp/domains/${domainId}/rules`).send(rules))
        .expect(400)
        .end((err, res) => {
          expect(err).to.not.exist;
          expect(res.body.error.details).to.contains('should have required property \'expression\'');
          done();
        });
    });
  });

  it('should respond 400 if id is not a string', function(done) {
    rules[0].id = 1;

    helpers.api.loginAsUser(app, adminUser.emails[0], password, (err, requestAsMember) => {
      expect(err).to.not.exist;

      requestAsMember(request(app).put(`/james/api/dlp/domains/${domainId}/rules`).send(rules))
        .expect(400)
        .end((err, res) => {
          expect(err).to.not.exist;
          expect(res.body.error.details).to.contains('id: should be string');
          done();
        });
    });
  });

  it('should respond 400 if expression is not a string', function(done) {
    rules[0].expression = 1;

    helpers.api.loginAsUser(app, adminUser.emails[0], password, (err, requestAsMember) => {
      expect(err).to.not.exist;

      requestAsMember(request(app).put(`/james/api/dlp/domains/${domainId}/rules`).send(rules))
        .expect(400)
        .end((err, res) => {
          expect(err).to.not.exist;
          expect(res.body.error.details).to.contains('expression: should be string');
          done();
        });
    });
  });

  it('should respond 400 if explanation is not a string', function(done) {
    rules[0].explanation = 1;

    helpers.api.loginAsUser(app, adminUser.emails[0], password, (err, requestAsMember) => {
      expect(err).to.not.exist;

      requestAsMember(request(app).put(`/james/api/dlp/domains/${domainId}/rules`).send(rules))
        .expect(400)
        .end((err, res) => {
          expect(err).to.not.exist;
          expect(res.body.error.details).to.contains('explanation: should be string');
          done();
        });
    });
  });

  it('should respond 400 if targetsSender is not a boolean', function(done) {
    rules[0].targetsSender = 'a';

    helpers.api.loginAsUser(app, adminUser.emails[0], password, (err, requestAsMember) => {
      expect(err).to.not.exist;

      requestAsMember(request(app).put(`/james/api/dlp/domains/${domainId}/rules`).send(rules))
        .expect(400)
        .end((err, res) => {
          expect(err).to.not.exist;
          expect(res.body.error.details).to.contains('targetsSender: should be boolean');
          done();
        });
    });
  });

  it('should respond 400 if targetsRecipients is not a boolean', function(done) {
    rules[0].targetsRecipients = 'a';

    helpers.api.loginAsUser(app, adminUser.emails[0], password, (err, requestAsMember) => {
      expect(err).to.not.exist;

      requestAsMember(request(app).put(`/james/api/dlp/domains/${domainId}/rules`).send(rules))
        .expect(400)
        .end((err, res) => {
          expect(err).to.not.exist;
          expect(res.body.error.details).to.contains('targetsRecipients: should be boolean');
          done();
        });
    });
  });

  it('should respond 400 if targetsContent is not a boolean', function(done) {
    rules[0].targetsContent = 'a';

    helpers.api.loginAsUser(app, adminUser.emails[0], password, (err, requestAsMember) => {
      expect(err).to.not.exist;

      requestAsMember(request(app).put(`/james/api/dlp/domains/${domainId}/rules`).send(rules))
        .expect(400)
        .end((err, res) => {
          expect(err).to.not.exist;
          expect(res.body.error.details).to.contains('targetsContent: should be boolean');
          done();
        });
    });
  });
});
