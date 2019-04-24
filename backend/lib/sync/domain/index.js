const q = require('q');
const { EVENTS } = require('../constants');

let pubsub;
let logger;
let clientModule;
let synchronizerModule;

module.exports = dependencies => {
  pubsub = dependencies('pubsub').local;
  logger = dependencies('logger');
  clientModule = require('../../client')(dependencies);
  synchronizerModule = require('./synchronizer')(dependencies);

  return {
    init,
    getStatus: synchronizerModule.getStatus,
    sync: synchronizerModule.sync
  };

  function init() {
    logger.info('Start listening on domain events');
    pubsub.topic(EVENTS.DOMAIN_CREATED).subscribe(onDomainCreated);
  }

  function onDomainCreated(event = {}) {
    const domain = event.payload;

    if (!domain || !domain.name) { return q.reject(new Error('domain name cannot be null')); }

    return createDomain(domain)
      .then(createDomainAliases);
  }

  function createDomainAliases(domain) {
    if (!domain.hostnames || !domain.hostnames.length) return;

    return clientModule.addDomainAliases(domain.name, domain.hostnames)
      .then(() => logger.info(`Created james domain aliases: ${domain.hostnames.join(', ')} for domain ${domain.name}`))
      .catch(err => logger.error('Error when creating james domain aliases', err));
  }

  function createDomain(domain) {
    return clientModule.createDomain(domain.name)
      .then(() => {
        logger.info(`Created new james domain: ${domain.name}`);

        return domain;
      })
      .catch(err => {
        logger.error(`Error while creating james domain ${domain.name}:`, err);
      });
  }
};
