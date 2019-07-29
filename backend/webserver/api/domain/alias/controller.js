let logger;
let domainAlias;

module.exports = function(dependencies, lib) {
  logger = dependencies('logger');
  domainAlias = lib.domain.alias;

  return {
    addDomainAlias,
    removeDomainAlias
  };
};

function addDomainAlias(req, res) {
  const domain = req.domain;
  const alias = req.params.alias;

  domainAlias.addDomainAliases(domain, alias)
  .then(() => res.status(204).end())
  .catch(err => {
    const details = `Error while creating alias "${alias}" for domain "${domain.id}"`;

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

function removeDomainAlias(req, res) {
  const domain = req.domain;
  const alias = req.params.alias;

  domainAlias.removeDomainAliases(domain, alias)
  .then(() => res.status(204).end())
  .catch(err => {
    const details = `Error while removing alias "${alias}" for domain "${domain.id}"`;

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
