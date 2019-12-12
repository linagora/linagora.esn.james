const { QUOTA_SCOPES } = require('./constants');

module.exports = (dependencies, lib) => {
  const logger = dependencies('logger');
  const { client } = lib;

  return {
    getQuota,
    setQuota
  };

  function getQuota(req, res) {
    const {
      query: { scope },
      targetUser,
      domain
    } = req;

    let promise;

    if (scope === QUOTA_SCOPES.PLATFORM) {
      promise = client.getPlatformQuota();
    } else if (scope === QUOTA_SCOPES.DOMAIN) {
      promise = client.getDomainQuota(domain.name);
    } else {
      promise = client.getUserQuota(targetUser.preferredEmail);
    }

    return promise
      .then(quota => res.status(200).json(quota))
      .catch(err => {
        const details = 'Error while getting quota';

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

  function setQuota(req, res) {
    const {
      query: { scope },
      targetUser,
      domain,
      body: quota
    } = req;

    let promise;

    if (scope === QUOTA_SCOPES.PLATFORM) {
      promise = client.setPlatformQuota(quota);
    } else if (scope === QUOTA_SCOPES.DOMAIN) {
      promise = client.setDomainQuota(domain.name, quota);
    } else {
      promise = client.setUserQuota(targetUser.preferredEmail, quota);
    }

    return promise
      .then(() => res.status(204).end())
      .catch(err => {
        const details = 'Error while setting quota';

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
