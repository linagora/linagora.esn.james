module.exports = (dependencies, lib) => {
  const logger = dependencies('logger');

  return {
    listDomains
  };

  function listDomains(req, res) {
    return lib.domain.listDomains()
      .then(domains => res.status(200).json(domains))
      .catch(err => {
        const details = 'Error while listing domains from James server';

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
