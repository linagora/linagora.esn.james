const { MAIL_REPOSITORY_PATH_PREFIXES } = require('./constants');

module.exports = () => {
  return {
    loadRepositoryPath
  };

  /**
   * Load repository path from repository param and store it in req object
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  function loadRepositoryPath(req, res, next) {
    const { repository } = req.params;
    const supportedRepositories = Object.keys(MAIL_REPOSITORY_PATH_PREFIXES);

    if (supportedRepositories.indexOf(repository) >= 0) {
      req.repositoryPath = `${MAIL_REPOSITORY_PATH_PREFIXES[repository]}/${req.domain.name}`;

      return next();
    }

    res.status(400).json({
      error: {
        code: 400,
        message: 'Bad Request',
        details: `Invalid repository. Supported repositories: ${supportedRepositories.join(',')}`
      }
    });
  }
};
