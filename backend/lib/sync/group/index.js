let synchronizerModule;
let clientModule;
let logger;
let groupModule;

module.exports = (dependencies) => {
  groupModule = dependencies('linagora.esn.group').lib;
  logger = dependencies('logger');
  synchronizerModule = require('./synchronizer')(dependencies);
  clientModule = require('../../client')(dependencies);

  return {
    init,
    getStatus: synchronizerModule.getStatus,
    sync: synchronizerModule.sync
  };
};

function init() {
  groupModule.registry.register('JAMES', {
    addGroupMembers,
    createGroup,
    deleteGroup,
    removeGroupMembers,
    updateGroup
  });
}

function createGroup(group) {
  if (!group) { return Promise.reject(new Error('group cannot be null')); }

  return groupModule.group.getAllMembers(group)
    .then(members => members.map(groupModule.group.getMemberEmail))
    .then(memberEmails => clientModule.addGroup(group.email, memberEmails))
    .then(() => {
      logger.debug(`Added ${group.members.length} member(s) to group ${group.email}`);
    })
    .catch((err) => {
      logger.error(`Error while adding members to group ${group.email}`, err);
    });
}

function updateGroup(oldGroup, newGroup) {
  if (!oldGroup || !newGroup) { return Promise.reject(new Error('both old and new group are required')); }

  if (oldGroup.email === newGroup.email) {
    logger.debug('Group updated but email is not modified');

    return Promise.resolve();
  }

  return clientModule.updateGroup(oldGroup.email, newGroup.email)
    .then(() => {
      logger.debug(`Changed group email from ${oldGroup.email} to ${newGroup.email}`);
    })
    .catch((err) => {
      logger.error(`Error while changing group email from ${oldGroup.email} to ${newGroup.email}`, err);
    });
}

function deleteGroup(group) {
  if (!group) { return Promise.reject(new Error('group cannot be null')); }

  return clientModule.removeGroup(group.email)
    .then(() => {
      logger.debug(`Removed group ${group.email}`);
    })
    .catch((err) => {
      logger.error(`Error while removing group ${group.email}`, err);
    });
}

function addGroupMembers(group, members) {
  return Promise.all(members.map(groupModule.group.resolveMember))
    .then(members => members.map(groupModule.group.getMemberEmail))
    .then(memberEmails => {
      logger.debug(`Adding members to group ${group.email} ${memberEmails}`);

      return clientModule.addGroupMembers(group.email, memberEmails);
    })
    .then(() => {
      logger.debug(`Added ${members.length} member(s) to group ${group.email}`);
    })
    .catch((err) => {
      logger.error(`Error while adding members to group ${group.email}`, err);
    });
}

function removeGroupMembers(group, members) {
  return Promise.all(members.map(groupModule.group.resolveMember))
    .then(members => members.map(groupModule.group.getMemberEmail))
    .then(memberEmails => {
      logger.debug(`Removing members from group ${group.email} ${memberEmails}`);

      return clientModule.removeGroupMembers(group.email, memberEmails);
    })
    .then(() => {
      logger.debug(`Removed ${members.length} member(s) from group ${group.email}`);
    })
    .catch((err) => {
      logger.error(`Error while removing members from group ${group.email}`, err);
    });
}
