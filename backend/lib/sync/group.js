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
  pubsub.topic(EVENTS.GROUP_DELETED).subscribe(onGroupDeleted);
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
