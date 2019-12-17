module.exports = function(dependencies, lib) {
  const logger = dependencies('logger');
  const client = lib.client;

  return {
    getRule,
    listRules,
    storeRules
  };

  function getRule(req, res) {
    const domainName = req.domain.name;
    const ruleId = req.params.ruleId;

    client.getDlpRule(domainName, req.params.ruleId)
      .then(rule => res.status(200).json(rule))
      .catch(err => {
        const details = `Error while getting DLP rule id "${ruleId}" for domain "${domainName}"`;

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
