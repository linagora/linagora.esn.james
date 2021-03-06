const _ = require('lodash');

module.exports = dependencies => {
  const logger = dependencies('logger');
  const esnConfig = dependencies('esn-config');
  const clientModule = require('../../client')(dependencies);

  return {
    sync
  };

  function sync(user) {
    return esnConfig('allowDomainAdminToManageUserEmails')
      .inModule('core')
      .get()
      .then(allowDomainAdminToManageUserEmails => {
        if (!allowDomainAdminToManageUserEmails) return;

        return _getStatus(user).then(status => {
          if (status.ok) {
            return;
          }

          const promises = [];

          if (status.notAddedAliases.length > 0) {
            promises.push(clientModule.addUserAliases(user.preferredEmail, status.notAddedAliases));
          }

          if (status.notRemovedAliases.length > 0) {
            promises.push(clientModule.removeUserAliases(user.preferredEmail, status.notRemovedAliases));
          }

          return Promise.all(promises)
            .then(() => {
              logger.debug(`Synchronized aliases of user "${user.preferredEmail}": added ${status.notAddedAliases.length} / removed ${status.notRemovedAliases.length}`);
            })
            .catch(err => logger.debug(`Error while synchronizing aliases of user ${user.preferredEmail}`, err));
        });
      });
  }

  function _getStatus(user) {
    const userAliases = user.accounts
      .find(account => account.type === 'email').emails
      .filter(email => email !== user.preferredEmail);

    return clientModule.listUserAliases(user.preferredEmail)
      .then(aliases => aliases.map(alias => alias.source))
      .then(jamesUserAliases => {
        const notAddedAliases = _.difference(userAliases, jamesUserAliases);
        const notRemovedAliases = _.difference(jamesUserAliases, userAliases);
        const ok = notAddedAliases.length === 0 && notRemovedAliases.length === 0;

        return {
          ok,
          notAddedAliases,
          notRemovedAliases
        };
      });
  }
};
