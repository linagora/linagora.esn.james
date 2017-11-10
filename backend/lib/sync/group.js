const q = require('q');
const { EVENTS } = require('./constants');

let clientModule;
let pubsub;
let logger;
let groupModule;

module.exports = (dependencies) => {
  groupModule = dependencies('linagora.esn.group').lib.group;
  pubsub = dependencies('pubsub').local;
  logger = dependencies('logger');
  clientModule = require('../client')(dependencies);

  return {
    init
  };
};

function init() {
  logger.info('Start listening on group events');
  pubsub.topic(EVENTS.GROUP_CREATED).subscribe(onGroupCreated);
  pubsub.topic(EVENTS.GROUP_UPDATED).subscribe(onGroupUpdated);
  pubsub.topic(EVENTS.GROUP_DELETED).subscribe(onGroupDeleted);
  pubsub.topic(EVENTS.GROUP_MEMBERS_ADDED).subscribe(onGroupMembersAdded);
  pubsub.topic(EVENTS.GROUP_MEMBERS_REMOVED).subscribe(onGroupMembersRemoved);
}

function onGroupCreated(event = {}) {
  const group = event.payload;

  if (!group) { return q.reject(new Error('group cannot be null')); }

  return groupModule.getAllMembers(group)
    .then(members => members.map(groupModule.getMemberEmail))
    .then(memberEmails => clientModule.addGroup(group.email, memberEmails))
    .then(() => {
      logger.debug(`Added ${group.members.length} member(s) to group ${group.email}`);
    })
    .catch((err) => {
      logger.error(`Error while adding members to group ${group.email}`, err);
    });
}

function onGroupUpdated(event = {}) {
  const { old: oldGroup, new: newGroup } = event.payload || {};

  if (!oldGroup || !newGroup) { return q.reject(new Error('both old and new group are required')); }

  if (oldGroup.email === newGroup.email) {
    logger.debug('Group updated but email is not modified');

    return q.resolve();
  }

  return clientModule.updateGroup(oldGroup.email, newGroup.email)
    .then(() => {
      logger.debug(`Changed group email from ${oldGroup.email} to ${newGroup.email}`);
    })
    .catch((err) => {
      logger.error(`Error while changing group email from ${oldGroup.email} to ${newGroup.email}`, err);
    });
}

function onGroupDeleted(event = {}) {
  const group = event.payload;

  if (!group) { return q.reject(new Error('group cannot be null')); }

  return clientModule.removeGroup(group.email)
    .then(() => {
      logger.debug(`Removed group ${group.email}`);
    })
    .catch((err) => {
      logger.error(`Error while removing group ${group.email}`, err);
    });
}

function onGroupMembersAdded(event = {}) {
  const { group, members } = event.payload;

  return q.all(members.map(groupModule.resolveMember))
    .then(members => members.map(groupModule.getMemberEmail))
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

function onGroupMembersRemoved(event = {}) {
  const { group, members } = event.payload;

  return q.all(members.map(groupModule.resolveMember))
    .then(members => members.map(groupModule.getMemberEmail))
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
