const { Client } = require('@linagora/james-admin-client');

let esnConfig;
let tokenModule;

module.exports = dependencies => {
  esnConfig = dependencies('esn-config');
  tokenModule = require('./token')(dependencies);

  return {
    addDestinationsToForward,
    addDomainAliases,
    addGroup,
    addGroupMembers,
    addUserAlias,
    addUserAliases,
    createDomain,
    exportDeletedMessages,
    getDomainQuota,
    getPlatformQuota,
    getDlpRule,
    getGroupMembers,
    getUserQuota,
    listDestinationsOfForward,
    listDlpRules,
    listDomains,
    listDomainAliases,
    listForwardsInDomain,
    listUserAliases,
    listUsersHavingAliases,
    removeDestinationsOfForward,
    removeDomain,
    removeDomainAliases,
    removeForward,
    removeGroup,
    removeGroupMembers,
    removeLocalCopyOfForward,
    removeUserAlias,
    removeUserAliases,
    setDomainQuota,
    setPlatformQuota,
    setUserQuota,
    restoreDeletedMessages,
    storeDlpRules,
    updateGroup
  };
};

/**
 * Add a new group
 * @param {String} group   - The group email address
 * @param {Array} members  - Array of group email address members
 * @return {Promise}       - Resolve on success
 */
function addGroup(group, members) {
  return addGroupMembers(group, members);
}

/**
 * Add multiple members to a group (this creates new group if it does not exist)
 * @param {String} group   - The group email address
 * @param {Array} members  - Array of group email address members
 * @return {Promise}       - Resolve on success
 */
function addGroupMembers(group, members) {
  return get().then(client =>
    Promise.all(members.map(member => client.addGroupMember(group, member)))
  );
}

/**
 * Add multiple destinations to a forward (creating the forward if need).
 *
 * @param {String} forward      - The forward email address
 * @param {Array} destinations  - Array of destination email addresses
 * @return {Promise}            - Resolve on success
 */
function addDestinationsToForward(forward, destinations) {
  return get().then(client =>
    Promise.all(destinations.map(destination => client.forward.addDestination(forward, destination)))
  );
}

/**
 * Get (all) group members. In case of error while calling webadmin API, an
 * empty array is resolved because James respond 404 when group has no members
 * @param  {String} group - The group email address
 * @return {Promise}      - Resolve group members on success
 */
function getGroupMembers(group) {
  return get().then(client => client.listGroupMembers(group).catch(() => []));
}

/**
 * Remove a forward.
 *
 * @param  {String} forward - The forward to be removed
 * @return {Promise}        - Resolve on success
 */
function removeForward(forward) {
  return get().then(client =>
    client.forward.listDestinationsOfForward(forward)
      .then(destinations => destinations.map(destination => destination.mailAddress))
      .then(destinations => Promise.all(destinations.map(destination => client.forward.removeDestination(forward, destination))))
  );
}

/**
 * Remove a group
 * @param  {String} group - The group email address
 * @return {Promise}      - Resolve on success
 */
function removeGroup(group) {
  return get().then(client =>
    client.listGroupMembers(group)
      .then(members =>
        Promise.all(members.map(member => client.removeGroupMember(group, member)))
      )
  );
}

/**
 * Remove multiple members of a group
 * @param  {String} group   - The group email address
 * @param  {Arrayy} members - Array of group members to be Removed
 * @return {Promise}        - Resolve on success
 */
function removeGroupMembers(group, members) {
  return get().then(client =>
    Promise.all(members.map(member => client.removeGroupMember(group, member)))
  );
}

/**
 * Add domain aliases
 * @param {String} domainName - the name of target domain
 * @param {Array} domainAliases - an array of aliases name to add
 * @return {Promise} - Resolve on success
 */
function addDomainAliases(domainName, domainAliases) {
  return get()
    .then(client => Promise.all(domainAliases.map(alias => client.addDomainAlias(domainName, alias))));
}

/**
 * Remove aliases of a domain
 * @param  {String} domainName   - Name of the target domain
 * @param  {Array} aliases  - Array of aliases to removed
 * @return {Promise}             - Resolve on success
 */
function removeDomainAliases(domainName, aliases) {
  return get()
    .then(client => Promise.all(aliases.map(alias => client.removeDomainAlias(domainName, alias))));
}

/**
 * Remove local copy of a specific foward.
 * Local copy means that forward email address itself is one destination.
 *
 * @param {String} forward  - The forward email address
 * @return {Promise}        - Resolve on success
 */
function removeLocalCopyOfForward(forward) {
  return removeDestinationsOfForward(forward, [forward]);
}

/**
 * Update a group address
 * @param  {String} oldGroup - The old group email address
 * @param  {String} newGroup - The new group email address
 * @return {Promise}         - Resolve on success
 */
function updateGroup(oldGroup, newGroup) {
  if (oldGroup === newGroup) {
    return Promise.reject(new Error('nothing to update'));
  }

  return get().then(client =>
    client.listGroupMembers(oldGroup)
      .then(members => Promise.all([
        ...members.map(member => client.addGroupMember(newGroup, member)),
        ...members.map(member => client.removeGroupMember(oldGroup, member))
      ]))
  );
}

/**
 * create a new domain
 * @param {String} domainName - Name of the new domain
 * @return {Promise}          - Resolve on success
 */
function createDomain(domainName) {
  return get().then(client => client.createDomain(domainName));
}

/**
 * List destinations of a forward. James returns 404 when forward does not have any destination,
 * so an empty array will be resolved in that case.
 *
 * @param {String} forward  - The forward email address
 * @return {Promise}        - Resolve on success
 */
function listDestinationsOfForward(forward) {
  return get().then(client =>
    client.forward.listDestinationsOfForward(forward)
      .then(destinations => destinations.map(destination => destination.mailAddress))
      .catch(err => {
        if (err.response.status === 404) {
          return [];
        }

        return err;
      }));
}

/**
 * list domains
 * @return {Promise}          - Resolve on success
 */
function listDomains() {
  return get().then(client => client.listDomains());
}

/**
 * list all aliases of a domain
 * @param  {String} domainName  - Name of the domain
 * @return {Promise}            - Resolve on success
 */
function listDomainAliases(domainName) {
  return get()
    .then(client => client.listDomainAliases(domainName))
    .catch(err => {
      // If there is no domain aliases, james will respond with 404
      if (err.response &&
        err.response.data &&
        err.response.data.message &&
        err.response.data.message.match(/Cannot find mappings for/)) {

        return [];
      }

      return Promise.reject(err);
    });
}

/**
 * List forwards in a specific domain.
 *
 * @param  {String} domainName  - Name of the domain
 * @return {Promise}            - Resolve list forwards on success
 */
function listForwardsInDomain(domainName) {
  return get().then(client => client.forward.list())
              .then(forwards => forwards.filter(forward => forward.endsWith(domainName)));
}

/**
 * Remove destinations of a forward.
 *
 * @param {String} forward      - The forward email address
 * @param {Array} destinations  - Array of destination email addresses
 * @return {Promise}            - Resolve on success
 */
function removeDestinationsOfForward(forward, destinations) {
  return get().then(client =>
    Promise.all(destinations.map(destination => client.forward.removeDestination(forward, destination)))
  );
}

/**
 * Remove domain
 * @param  {String} domainName - Name of the domain to be removed
 * @return {Promise}            - Resolve on success
 */
function removeDomain(domainName) {
  return get().then(client => client.removeDomain(domainName));
}

/**
 * Listing users with aliases
 * @return {Promise} -Resolve on success
 */
function listUsersHavingAliases() {
  return get().then(client => client.listUsersHavingAliases());
}

/**
 * Listing alias sources of a user
 * @param  {String} user - The user preferred email address
 * @return {Promise} - Resolve on success
 */
function listUserAliases(user) {
  return get().then(client => client.listUserAliases(user));
}

/**
 * Adding a new alias to a user
 * @param  {String} user  - The user preferred email address
 * @param  {String} alias - Alias to add
 * @return {Promise}      - Resolve on success
 */
function addUserAlias(user, alias) {
  return get().then(client => client.addUserAlias(user, alias));
}

/**
 * Adding new aliases to a user
 * @param  {String} user   - The user preferred email address
 * @param  {Array} aliases - Array of aliases to add
 * @return {Promise}       - Resolve on success
 */
function addUserAliases(user, aliases) {
  return get().then(client =>
    Promise.all(aliases.map(alias => client.addUserAlias(user, alias)))
  );
}

/**
 * Removing an alias of a user
 * @param  {String} user  - The user preferred email address
 * @param  {String} alias - Alias to remove
 * @return {Promise}      - Resolve on success
 */
function removeUserAlias(user, alias) {
  return get().then(client => client.removeUserAlias(user, alias));
}

/**
 * Removing aliases of a user
 * @param  {String} user   - The user preferred email address
 * @param  {Array} aliases - Array of aliases to remove
 * @return {Promise}       - Resolve on success
 */
function removeUserAliases(user, aliases) {
  return get().then(client =>
    Promise.all(aliases.map(alias => client.removeUserAlias(user, alias)))
  );
}

/**
 * Restore deleted messages of a user
 * @param  {String} user       - The user preferred email address
 * @param  {Object} rules      - Set of rules to filter out messages
 * @return {Promise}           - Resolve a task Id of the restoring process on success
 */
function restoreDeletedMessages(user, rules) {
  return get().then(client => client.restoreDeletedMessages(user, rules));
}

/**
 * Export deleted messages of a user
 * @param  {String} user        - The user preferred email address
 * @param  {String} exportTo    - The email address where the exported file is sent to
 * @param  {Object} rules       - Set of rules to filter out messages
 * @return {Promise}            - Resolve a task Id of the exporting process on success
 */
function exportDeletedMessages(user, exportTo, rules) {
  return get().then(client => client.exportDeletedMessages(user, exportTo, rules));
}

/**
 * Get a DLP rule with the given ID from a domain
 * @param  {String} domainName - Name of the domain
 * @param  {String} ruleId - ID of a specific rule
 * @return {Promise}      - Resolve a rule on success
 */
function getDlpRule(domainName, ruleId) {
  return get().then(client => client.dlpRules.get(domainName, ruleId));
}

/**
 * Get a list of DLP rules from a domain
 * @param  {String} domainName - Name of the domain
 * @return {Promise}      - Resolve a list of rules on success
 */
function listDlpRules(domainName) {
  return get()
    .then(client => client.dlpRules.list(domainName))
    .then(({ rules }) => rules);
}

/**
 * Store DLP rules from a domain
 * @param  {String} domainName - Name of the domain
 * @param  {String} rules - Set of rules to store
 * @return {Promise}      - Resolve on success
 */
function storeDlpRules(domainName, rules) {
  return get().then(client => client.dlpRules.store(domainName, rules));
}

/**
 * Get Webadmin Client instance
 * @return {Promise} - Resolve instance of Client on success
 */
function get() {
  return Promise.all([
    getWebadminApiEndpoint(),
    tokenModule.generate()
  ])
  .then(([apiUrl, token]) => new Client({ apiUrl, token }));
}

/**
 * Get Webadmin endpoint
 * @return {Promise} - Resolve the endpoint url (nullable) on success
 */
function getWebadminApiEndpoint() {
  return esnConfig('webadminApiBackend').inModule('linagora.esn.james').get();
}

/**
 * Get platform quota
 * @return {Promise} - Resolve with the quota on success
 */
function getPlatformQuota() {
  return get()
    .then(client => client.getQuota());
}

/**
 * Set platform quota
 * @param {Object} quota Contains count and size
 * Remove quota count/size if its value is null
 * Set quota count/size to unlimited if its value is -1
 * @return {Promise} - Resolve on success
 */
function setPlatformQuota(quota) {
  return get()
    .then(client => {
      const tasks = [];

      if (quota.count === null) {
        tasks.push(client.deleteQuotaCount());
      }

      if (quota.size === null) {
        tasks.push(client.deleteQuotaSize());
      }

      if (quota.count !== null || quota.size !== null) {
        tasks.push(client.setQuota(quota));
      }

      return Promise.all(tasks);
    });
}

/**
 * Get quota for a particular domain
 * @param {String} domainName name of the target domain
 * @return {Promise} - Resolve with the quota on success
 */
function getDomainQuota(domainName) {
  return get()
    .then(client => client.getDomainQuota(domainName));
}

/**
 * Set quota for a particular domain
 * @param {String} domainName name of the target domain
 * @param {Object} quota Contains count and size
 * Remove quota count/size if its value is null
 * Set quota count/size to unlimited if its value is -1
 * @return {Promise} - Resolve on success
 */
function setDomainQuota(domainName, quota) {
  return get()
    .then(client => {
      const tasks = [];

      if (quota.count === null) {
        tasks.push(client.deleteDomainQuotaCount(domainName));
      }

      if (quota.size === null) {
        tasks.push(client.deleteDomainQuotaSize(domainName));
      }

      if (quota.count !== null || quota.size !== null) {
        tasks.push(client.setDomainQuota(domainName, quota));
      }

      return Promise.all(tasks);
    });
}

/**
 * Get quota for a particular user
 * @param {String} username preferred email of the target user
 * @return {Promise} - Resolve with the quota on success
 */
function getUserQuota(username) {
  return get()
    .then(client => client.getUserQuota(username));
}

/**
 * Set quota for a particular user
 * @param {String} username preferred email of the target user
 * @param {Object} quota Contains count and size
 * Remove quota count/size if its value is null
 * Set quota count/size to unlimited if its value is -1
 * @return {Promise} - Resolve on success
 */
function setUserQuota(username, quota) {
  return get()
    .then(client => {
      const tasks = [];

      if (quota.count === null) {
        tasks.push(client.deleteUserQuotaCount(username));
      }

      if (quota.size === null) {
        tasks.push(client.deleteUserQuotaSize(username));
      }

      if (quota.count !== null || quota.size !== null) {
        tasks.push(client.setUserQuota(username, quota));
      }

      return Promise.all(tasks);
    });
}
