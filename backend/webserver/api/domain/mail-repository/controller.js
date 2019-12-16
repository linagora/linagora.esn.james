module.exports = (dependencies, { client }) => {
  const logger = dependencies('logger');

  return {
    getMail,
    listMails,
    removeMail,
    removeAllMails,
    reprocessMail,
    reprocessAllMails
  };

  function getMail(req, res) {
    const { additionalFields } = req.query;
    const { mailKey } = req.params;
    const { repositoryPath } = req;
    const options = {};

    if (additionalFields) {
      options.additionalFields = additionalFields.split(',');
    }

    let promise;

    if (req.headers.accept === 'message/rfc822') {
      promise = client.downloadEmlFileFromMailRepository(repositoryPath, mailKey)
        .then(mail => res.status(200).send(mail));
    } else {
      promise = client.getMailFromMailRepository(repositoryPath, mailKey, options)
        .then(mail => res.status(200).json(mail));
    }

    return promise
      .catch(err => {
        const details = 'Error while getting mail';

        logger.error(details, err);

        return res.status(500).json({
          error: {
            code: 500,
            message: 'Server Error',
            details
          }
        });
      });
  }

  function listMails(req, res) {
    const options = {
      offset: +req.query.offset || 0,
      limit: +req.query.limit || 50
    };

    return client.listMailsFromMailRepository(req.repositoryPath, options)
      .then(mails => res.status(200).json(mails))
      .catch(err => {
        const details = 'Error while listing mails';

        logger.error(details, err);

        return res.status(500).json({
          error: {
            code: 500,
            message: 'Server Error',
            details
          }
        });
      });
  }

  function removeMail(req, res) {
    const { mailKey } = req.params;

    return client.removeMailFromMailRepository(req.repositoryPath, mailKey)
      .then(() => res.status(204).end())
      .catch(err => {
        const details = 'Error while removing mail';

        logger.error(details, err);

        return res.status(500).json({
          error: {
            code: 500,
            message: 'Server Error',
            details
          }
        });
      });
  }

  function removeAllMails(req, res) {
    return client.removeAllMailsFromMailRepository(req.repositoryPath)
      .then(task => res.status(201).json(task))
      .catch(err => {
        const details = 'Error while removing mails';

        logger.error(details, err);

        return res.status(500).json({
          error: {
            code: 500,
            message: 'Server Error',
            details
          }
        });
      });
  }

  function reprocessMail(req, res) {
    const { processor, queue } = req.query;
    const { mailKey } = req.params;
    const options = {
      processor,
      queue
    };

    return client.reprocessMailFromMailRepository(req.repositoryPath, mailKey, options)
      .then(task => res.status(201).json(task))
      .catch(err => {
        const details = 'Error while reprocessing mail';

        logger.error(details, err);

        return res.status(500).json({
          error: {
            code: 500,
            message: 'Server Error',
            details
          }
        });
      });
  }

  function reprocessAllMails(req, res) {
    const { processor, queue } = req.query;
    const options = {
      processor,
      queue
    };

    return client.reprocessAllMailsFromMailRepository(req.repositoryPath, options)
      .then(task => res.status(201).json(task))
      .catch(err => {
        const details = 'Error while reprocessing mails';

        logger.error(details, err);

        return res.status(500).json({
          error: {
            code: 500,
            message: 'Server Error',
            details
          }
        });
      });
  }
};
