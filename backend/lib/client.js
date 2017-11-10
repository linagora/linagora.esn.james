const { Client } = require('james-admin-client');
const q = require('q');

let esnConfig;
let tokenModule;

module.exports = (dependencies) => {
  esnConfig = dependencies('esn-config');
  tokenModule = require('./token')(dependencies);

  return {
    addGroup,
    addGroupMembers,
    removeGroup,
    removeGroupMembers,
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
  return esnConfig('james').get().then(config => config && config.url);
}
