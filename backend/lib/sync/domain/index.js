const { EVENTS } = require('../constants');

let pubsub;
let logger;

module.exports = dependencies => {
  pubsub = dependencies('pubsub').local;
  logger = dependencies('logger');
  const { createDomain } = require('../../client')(dependencies);
  const { getStatus, sync } = require('./synchronizer')(dependencies);

  return {
    init,
    getStatus,
    sync
  };

  function init() {
    logger.info('Start listening on domain events');
    pubsub.topic(EVENTS.DOMAIN_CREATED).subscribe(onDomainCreated);
  }

  function onDomainCreated(event = {}) {
    const domain = event.payload;

    if (!domain || !domain.name) return Promise.reject(new Error('domain name cannot be null'));

    return _createDomain(domain);
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
