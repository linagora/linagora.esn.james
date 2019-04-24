const { Client } = require('@linagora/james-admin-client');
const q = require('q');

let esnConfig;
let tokenModule;

module.exports = (dependencies) => {
  esnConfig = dependencies('esn-config');
  tokenModule = require('./token')(dependencies);

  return {
    addDestinationsToForward,
    addDomainAliases,
    addGroup,
    addGroupMembers,
    createDomain,
    getGroupMembers,
    listDestinationsOfForward,
    listDomains,
    listForwardsInDomain,
    removeDestinationsOfForward,
    removeDomain,
    removeForward,
    removeGroup,
    removeGroupMembers,
    removeLocalCopyOfForward,
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
    q.all(members.map(member => client.addGroupMember(group, member)))
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
    q.all(destinations.map(destination => client.forward.addDestination(forward, destination)))
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
      .then(destinations => q.all(destinations.map(destination => client.forward.removeDestination(forward, destination))))
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
        q.all(members.map(member => client.removeGroupMember(group, member)))
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
    q.all(members.map(member => client.removeGroupMember(group, member)))
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
    return q.reject(new Error('nothing to update'));
  }

  return get().then(client =>
    client.listGroupMembers(oldGroup)
      .then(members => q.all([
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
    q.all(destinations.map(destination => client.forward.removeDestination(forward, destination)))
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
 * Get Webadmin Client instance
 * @return {Promise} - Resolve instance of Client on success
 */
function get() {
  return q.all([
      getWebadminApiEndpoint(),
      tokenModule.generate()
    ])
    .spread((apiUrl, token) => new Client({ apiUrl, token }));
}

/**
 * Get Webadmin endpoint
 * @return {Promise} - Resolve the endpoint url (nullable) on success
 */
function getWebadminApiEndpoint() {
  return esnConfig('webadminApiBackend').inModule('linagora.esn.james').get();
}
