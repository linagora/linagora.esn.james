module.exports = function(dependencies, lib) {
  const logger = dependencies('logger');
  const client = lib.client;

  return {
    getRule,
    listRules,
    storeRules
  };

  function getRule(req, res) {
    return res.status(200).json(req.rule);
  }

  function listRules(req, res) {
    const domainName = req.domain.name;

    client.listDlpRules(domainName)
      .then(rules => res.status(200).json(rules))
      .catch(err => {
        const details = `Error while getting DLP rules for domain "${domainName}"`;

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

  function storeRules(req, res) {
    const domainName = req.domain.name;
    const rules = { rules: req.body };

    client.storeDlpRules(domainName, rules)
      .then(() => res.status(204).end())
      .catch(err => {
        const details = `Error while storing DLP rules for domain "${domainName}"`;

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
