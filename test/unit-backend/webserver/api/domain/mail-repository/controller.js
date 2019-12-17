const { expect } = require('chai');
const sinon = require('sinon');

describe('The webserver/api/mail-repository/controller module', function() {
  let getModule, clientMock;
  const repositoryPath = 'repository/path';
  const mailKey = 'mail-key';

  beforeEach(function() {
    clientMock = {};

    getModule = () =>
      require(`${this.moduleHelpers.backendPath}/webserver/api/domain/mail-repository/controller`)(this.moduleHelpers.dependencies, { client: clientMock });
  });

  describe('The getMail method', function() {
    const mail = {foo: 'bar'};

    describe('Get email', function() {
      it('should respond 200 if success to get mail', function(done) {
        clientMock.getMailFromMailRepository = sinon.stub().returns(Promise.resolve(mail));

        const req = {
          query: { additionalFields: 'field1,field2' },
          repositoryPath,
          params: {
            mailKey
          },
          headers: {}
        };
        const res = {
          status(code) {
            expect(code).to.equal(200);

            return {
              json(json) {
                expect(json).to.deep.equal(mail);
                expect(clientMock.getMailFromMailRepository).to.have.been.calledWith(repositoryPath, mailKey, {
                  additionalFields: ['field1', 'field2']
                });
                done();
              }
            };
          }
        };

        getModule().getMail(req, res);
      });

      it('should respond 500 if it fails to get mail', function(done) {
        clientMock.getMailFromMailRepository = sinon.stub().returns(Promise.reject(new Error('something wrong')));

        const req = {
          query: { additionalFields: 'field1,field2' },
          repositoryPath,
          params: {
            mailKey
          },
          headers: {}
        };
        const res = {
          status(code) {
            expect(code).to.equal(500);

            return {
              json(json) {
                expect(json).to.deep.equal({
                  error: {
                    code: 500,
                    message: 'Server Error',
                    details: 'Error while getting mail'
                  }
                });
                expect(clientMock.getMailFromMailRepository).to.have.been.calledWith(repositoryPath, mailKey, {
                  additionalFields: ['field1', 'field2']
                });
                done();
              }
            };
          }
        };

        getModule().getMail(req, res);
      });
    });

    describe('Download email', function() {
      it('should respond 200 if success to download mail', function(done) {
        clientMock.downloadEmlFileFromMailRepository = sinon.stub().returns(Promise.resolve(mail));

        const req = {
          query: {},
          repositoryPath,
          params: {
            mailKey
          },
          headers: {
            accept: 'message/rfc822'
          }
        };
        const res = {
          status(code) {
            expect(code).to.equal(200);

            return {
              send(_mail) {
                expect(_mail).to.deep.equal(mail);
                expect(clientMock.downloadEmlFileFromMailRepository).to.have.been.calledWith(repositoryPath, mailKey);
                done();
              }
            };
          }
        };

        getModule().getMail(req, res);
      });

      it('should respond 500 if it fails to download mail', function(done) {
        clientMock.downloadEmlFileFromMailRepository = sinon.stub().returns(Promise.reject(new Error('something wrong')));

        const req = {
          query: {},
          repositoryPath,
          params: {
            mailKey
          },
          headers: {
            accept: 'message/rfc822'
          }
        };
        const res = {
          status(code) {
            expect(code).to.equal(500);

            return {
              json(json) {
                expect(json).to.deep.equal({
                  error: {
                    code: 500,
                    message: 'Server Error',
                    details: 'Error while getting mail'
                  }
                });
                expect(clientMock.downloadEmlFileFromMailRepository).to.have.been.calledWith(repositoryPath, mailKey);
                done();
              }
            };
          }
        };

        getModule().getMail(req, res);
      });
    });
  });

  describe('The listMails method', function() {
    const options = {
      offset: 0,
      limit: 10
    };

    it('should respond 200 if success to list mails', function(done) {
      const mails = [];

      clientMock.listMailsFromMailRepository = sinon.stub().returns(Promise.resolve(mails));

      const req = {
        query: options,
        repositoryPath
      };
      const res = {
        status(code) {
          expect(code).to.equal(200);

          return {
            json(json) {
              expect(json).to.deep.equal(mails);
              expect(clientMock.listMailsFromMailRepository).to.have.been.calledWith(repositoryPath, options);
              done();
            }
          };
        }
      };

      getModule().listMails(req, res);
    });

    it('should respond 500 if it fails to list mails', function(done) {
      clientMock.listMailsFromMailRepository = sinon.stub().returns(Promise.reject(new Error('something wrong')));

      const req = {
        query: options,
        repositoryPath
      };
      const res = {
        status(code) {
          expect(code).to.equal(500);

          return {
            json(json) {
              expect(json).to.deep.equal({
                error: {
                  code: 500,
                  message: 'Server Error',
                  details: 'Error while listing mails'
                }
              });
              expect(clientMock.listMailsFromMailRepository).to.have.been.calledWith(repositoryPath, options);
              done();
            }
          };
        }
      };

      getModule().listMails(req, res);
    });
  });

  describe('The removeMail method', function() {
    it('should respond 200 if success to delete mail', function(done) {
      clientMock.removeMailFromMailRepository = sinon.stub().returns(Promise.resolve());

      const req = {
        repositoryPath,
        params: {
          mailKey
        }
      };
      const res = {
        status(code) {
          expect(code).to.equal(204);

          return {
            end() {
              expect(clientMock.removeMailFromMailRepository).to.have.been.calledWith(repositoryPath, mailKey);
              done();
            }
          };
        }
      };

      getModule().removeMail(req, res);
    });

    it('should respond 500 if it fails to delte mail', function(done) {
      clientMock.removeMailFromMailRepository = sinon.stub().returns(Promise.reject(new Error('something wrong')));

      const req = {
        repositoryPath,
        params: {
          mailKey
        }
      };
      const res = {
        status(code) {
          expect(code).to.equal(500);

          return {
            json(json) {
              expect(json).to.deep.equal({
                error: {
                  code: 500,
                  message: 'Server Error',
                  details: 'Error while removing mail'
                }
              });
              expect(clientMock.removeMailFromMailRepository).to.have.been.calledWith(repositoryPath, mailKey);
              done();
            }
          };
        }
      };

      getModule().removeMail(req, res);
    });
  });

  describe('The removeAllMails method', function() {
    it('should respond 201 if success to delete mails', function(done) {
      const task = { taskId: 'task-id' };

      clientMock.removeAllMailsFromMailRepository = sinon.stub().returns(Promise.resolve(task));

      const req = {
        repositoryPath
      };
      const res = {
        status(code) {
          expect(code).to.equal(201);

          return {
            json(json) {
              expect(json).to.deep.equal(task);
              expect(clientMock.removeAllMailsFromMailRepository).to.have.been.calledWith(repositoryPath);
              done();
            }
          };
        }
      };

      getModule().removeAllMails(req, res);
    });

    it('should respond 500 if it fails to delete mails', function(done) {
      clientMock.removeAllMailsFromMailRepository = sinon.stub().returns(Promise.reject(new Error('something wrong')));

      const req = {
        repositoryPath
      };
      const res = {
        status(code) {
          expect(code).to.equal(500);

          return {
            json(json) {
              expect(json).to.deep.equal({
                error: {
                  code: 500,
                  message: 'Server Error',
                  details: 'Error while removing mails'
                }
              });
              expect(clientMock.removeAllMailsFromMailRepository).to.have.been.calledWith(repositoryPath);
              done();
            }
          };
        }
      };

      getModule().removeAllMails(req, res);
    });
  });

  describe('The reprocessMail method', function() {
    const options = {
      processor: 'processor',
      queue: 'queue'
    };

    it('should respond 201 if success to reprocess mail', function(done) {
      const task = { taskId: 'task-id' };

      clientMock.reprocessMailFromMailRepository = sinon.stub().returns(Promise.resolve(task));

      const req = {
        query: options,
        repositoryPath,
        params: {
          mailKey
        }
      };
      const res = {
        status(code) {
          expect(code).to.equal(201);

          return {
            json(json) {
              expect(json).to.deep.equal(task);
              expect(clientMock.reprocessMailFromMailRepository).to.have.been.calledWith(repositoryPath, mailKey, options);
              done();
            }
          };
        }
      };

      getModule().reprocessMail(req, res);
    });

    it('should respond 500 if it fails to reprocess mail', function(done) {
      clientMock.reprocessMailFromMailRepository = sinon.stub().returns(Promise.reject(new Error('something wrong')));

      const req = {
        query: options,
        repositoryPath,
        params: {
          mailKey
        }
      };
      const res = {
        status(code) {
          expect(code).to.equal(500);

          return {
            json(json) {
              expect(json).to.deep.equal({
                error: {
                  code: 500,
                  message: 'Server Error',
                  details: 'Error while reprocessing mail'
                }
              });
              expect(clientMock.reprocessMailFromMailRepository).to.have.been.calledWith(repositoryPath, mailKey, options);
              done();
            }
          };
        }
      };

      getModule().reprocessMail(req, res);
    });
  });

  describe('The reprocessAllMails method', function() {
    const options = {
      processor: 'processor',
      queue: 'queue'
    };

    it('should respond 201 if success to reprocess mails', function(done) {
      const task = { taskId: 'task-id' };

      clientMock.reprocessAllMailsFromMailRepository = sinon.stub().returns(Promise.resolve(task));

      const req = {
        query: options,
        repositoryPath
      };
      const res = {
        status(code) {
          expect(code).to.equal(201);

          return {
            json(json) {
              expect(json).to.deep.equal(task);
              expect(clientMock.reprocessAllMailsFromMailRepository).to.have.been.calledWith(repositoryPath, options);
              done();
            }
          };
        }
      };

      getModule().reprocessAllMails(req, res);
    });

    it('should respond 500 if it fails to reprocess mails', function(done) {
      clientMock.reprocessAllMailsFromMailRepository = sinon.stub().returns(Promise.reject(new Error('something wrong')));

      const req = {
        query: options,
        repositoryPath
      };
      const res = {
        status(code) {
          expect(code).to.equal(500);

          return {
            json(json) {
              expect(json).to.deep.equal({
                error: {
                  code: 500,
                  message: 'Server Error',
                  details: 'Error while reprocessing mails'
                }
              });
              expect(clientMock.reprocessAllMailsFromMailRepository).to.have.been.calledWith(repositoryPath, options);
              done();
            }
          };
        }
      };

      getModule().reprocessAllMails(req, res);
    });
  });
});
