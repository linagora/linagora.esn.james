const { EVENTS } = require('../constants');

let pubsub;
let logger;

module.exports = dependencies => {
  pubsub = dependencies('pubsub').local;
  logger = dependencies('logger');
  const { addDomainAliases, createDomain, isDomainCreated } = require('../../client')(dependencies);
  const { getStatus, sync, syncDomainAliases } = require('./synchronizer')(dependencies);

  return {
    init,
    getStatus,
    sync
  };

  function init() {
    logger.info('Start listening on domain events');
    pubsub.topic(EVENTS.DOMAIN_CREATED).subscribe(onDomainCreated);
    pubsub.topic(EVENTS.DOMAIN_UPDATED).subscribe(onDomainUpdated);
  }

  function onDomainCreated(event = {}) {
    const domain = event.payload;

    if (!domain || !domain.name) return Promise.reject(new Error('domain name cannot be null'));

    return _createDomain(domain)
      .then(_createDomainAliases);
  }

  function onDomainUpdated(event = {}) {
    const domain = event.payload;

    if (!domain || !domain.name) return Promise.reject(new Error('domain name cannot be null'));

    return isDomainCreated(domain.name)
      .then(created => {
        if (created) return syncDomainAliases(domain);

        return _createDomain(domain).then(syncDomainAliases);
      })
      .catch(err => logger.error(`Error while synchronizing james domain aliases for domain ${domain.name}`, err));
  }

  function _createDomainAliases(domain) {
    if (!domain.hostnames || !domain.hostnames.length) return;

    return addDomainAliases(domain.name, domain.hostnames)
      .then(() => logger.info(`Created james domain aliases: ${domain.hostnames.join(', ')} for domain ${domain.name}`))
      .catch(err => logger.error('Error when creating james domain aliases', err));
  }

  function _createDomain(domain) {
    return createDomain(domain.name).then(() => {
      logger.info(`Created new james domain: ${domain.name}`);

      return domain;
    }).catch(err => {
      logger.error(`Error while creating james domain ${domain.name}:`, err);
    });
  }
};
