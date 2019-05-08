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
    getDomainAliasesStatus,
    getStatus,
    sync,
    syncDomainAliases
  };
};

function getStatus() {
  return Promise.all([
    q.denodeify(coreDomain.list)({}),
    clientModule.listDomains(),
    clientModule.listDomainMappings()
  ]).then(([esnDomains, jamesDomains, jamesDomainMappings]) => {
    const notAddedDomains = _.difference(esnDomains.map(domain => domain.name), jamesDomains);
    const notRemovedDomains = _.difference(jamesDomains, esnDomains.map(domain => domain.name));
    const notAddedDomainMappings = [];
    const notRemovedDomainMappings = [];

    esnDomains.forEach(domain => {
      const aliasesToAdd = _.difference(domain.hostnames, jamesDomainMappings[domain.name]);
      const aliasesToRemove = _.difference(jamesDomainMappings[domain.name], domain.hostnames);

      if (aliasesToAdd.length) {
        notAddedDomainMappings.push({
          source: domain.name,
          aliases: aliasesToAdd
        });
      }

      if (aliasesToRemove.length) {
        notRemovedDomainMappings.push({
          source: domain.name,
          aliases: aliasesToRemove
        });
      }
    });

    notRemovedDomains.forEach(domainName => {
      if (jamesDomainMappings[domainName]) {
        notRemovedDomainMappings.push({
          source: domainName,
          aliases: jamesDomainMappings[domainName]
        });
      }
    });

    const ok = _.isEmpty(notAddedDomains) && _.isEmpty(notAddedDomainMappings) && _.isEmpty(notRemovedDomainMappings) && _.isEmpty(notRemovedDomains);

    return {
      ok,
      notAddedDomains,
      notAddedDomainMappings,
      notRemovedDomains,
      notRemovedDomainMappings
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

    if (!_.isEmpty(status.notAddedDomainMappings)) {
      status.notAddedDomainMappings.forEach(mapping => {
        syncPromises.push(clientModule.addDomainAliases(mapping.source, mapping.aliases));
      });
    }

    if (!_.isEmpty(status.notRemovedDomainMappings)) {
      status.notRemovedDomainMappings.forEach(mapping => {
        syncPromises.push(clientModule.removeDomainAliases(mapping.source, mapping.aliases));
      });
    }

    return q.all(syncPromises)
    .then(() => logger.debug(`Added ${status.notAddedDomains.length} new domains, ${status.notAddedDomainMappings.length} domain aliases and remove ${status.notRemovedDomains.length} domains, ${status.notRemovedDomainMappings.length} domain aliases`))
    .catch((err) => logger.error('Error while creating james domains', err));
  });
}

function getDomainAliasesStatus(domain) {
  return clientModule.listDomainAliases(domain.name).then((aliases) => {
    const notAddedAliases = _.difference(domain.hostnames, aliases);
    const notRemovedAliases = _.difference(aliases, domain.hostnames);
    const ok = _.isEmpty(notAddedAliases) && _.isEmpty(notRemovedAliases);

    return {
      ok,
      notAddedAliases,
      notRemovedAliases
    };
  }).catch(err => logger.error(`Error while geting domain aliases status of domain ${domain.name}`, err));
}

function syncDomainAliases(domain) {
  return getDomainAliasesStatus(domain).then((status) => {
    if (status.ok) return;

    const syncPromises = [];

    if (!_.isEmpty(status.notAddedAliases)) {
      syncPromises.push(clientModule.addDomainAliases(domain.name, status.notAddedAliases));
    }

    if (!_.isEmpty(status.notRemovedAliases)) {
      syncPromises.push(clientModule.removeDomainAliases(domain.name, status.notRemovedAliases));
    }

    return Promise.all(syncPromises)
      .then(() => logger.debug(`Finish synchronizing domain ${domain.name}`))
      .catch(err => logger.error(`Error while synchronizing domain ${domain.name}`, err));
  });
}
