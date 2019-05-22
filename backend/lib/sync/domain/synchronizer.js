const { difference, isEmpty } = require('lodash');

module.exports = dependencies => {
  const logger = dependencies('logger');
  const {
    createDomain,
    listDomains,
    removeDomain
  } = require('../../client')(dependencies);
  const { list: listESNDomains } = dependencies('domain');

  return {
    getStatus,
    sync
  };

  function getStatus() {
    return Promise.all([
      _listESNDomainNames(),
      listDomains()
    ]).then(([esnDomains, jamesDomains]) => {
      const notAddedDomains = difference(esnDomains, jamesDomains);
      const notRemovedDomains = difference(jamesDomains, esnDomains);
      const ok = isEmpty(notAddedDomains) && isEmpty(notRemovedDomains);

      return {
        ok,
        notAddedDomains,
        notRemovedDomains
      };
    }).catch(err => {
      logger.error('Error while getting sync status of james and esn domains', err);
    });
  }

  function sync() {
    return getStatus().then(status => {
      if (status.ok) {
        return;
      }

      const syncPromises = [];

      if (!isEmpty(status.notAddedDomains)) {
        status.notAddedDomains.forEach(domain => {
          syncPromises.push(createDomain(domain));
        });
      }

      if (!isEmpty(status.notRemovedDomains)) {
        status.notRemovedDomains.forEach(domain => {
          syncPromises.push(removeDomain(domain));
        });
      }

      return Promise.all(syncPromises)
      .then(() => {
        logger.debug(`Done synchronizing by adding ${status.notAddedDomains.length} new domains and remove ${status.notRemovedDomains.length} domains`);
      })
      .catch(err => {
        logger.error('Error while synchronizing domains', err);
      });
    });
  }

  function _listESNDomainNames() {
    return new Promise((resolve, reject) => listESNDomains({}, (err, domains) => {
      if (err) return reject(err);

      return resolve(domains.map((domain) => domain.name));
    }));
  }
};
