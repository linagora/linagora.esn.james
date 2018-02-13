const q = require('q');
const _ = require('lodash');

let clientModule;
let coreDomain;
let logger;

module.exports = (dependencies) => {
  clientModule = require('../../client')(dependencies);
  logger = dependencies('logger');
  coreDomain = dependencies('domain');

  return {
    getStatus,
    sync
  };
};

function getStatus() {
  return q.all([
    q.denodeify(coreDomain.list)({}).then(domains => domains.map((domain) => domain.name)),
    clientModule.listDomains()
  ]).spread((esnDomains, jamesDomains) => {
    const notAddedDomains = _.difference(esnDomains, jamesDomains);
    const notRemovedDomains = _.difference(jamesDomains, esnDomains);
    const ok = _.isEmpty(notAddedDomains) && _.isEmpty(notRemovedDomains);

    return {
      ok,
      notAddedDomains,
      notRemovedDomains
    };
  }).catch((err) => {
    logger.error('Error while getting sync status of james and esn domains', err);
  });
}

function sync() {
  return getStatus().then((status) => {
    if (status.ok) {
      return;
    }

    const syncPromises = [];

    if (!_.isEmpty(status.notAddedDomains)) {
      status.notAddedDomains.forEach((domain) => {
        syncPromises.push(clientModule.createDomain(domain));
      });
    }

    if (!_.isEmpty(status.notRemovedDomains)) {
      status.notRemovedDomains.forEach((domain) => {
        syncPromises.push(clientModule.removeDomain(domain));
      });
    }

    return q.all(syncPromises)
    .then(() => {
      logger.debug(`Done synchronizing by adding ${status.notAddedDomains.length} new domains and remove ${status.notRemovedDomains.length} domains`);
    })
    .catch((err) => {
      logger.error('Error while creating james domains', err);
    });
  });
}
