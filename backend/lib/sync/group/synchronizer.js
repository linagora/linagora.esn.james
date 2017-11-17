const q = require('q');
const _ = require('lodash');

let clientModule;
let logger;
let groupModule;

module.exports = (dependencies) => {
  groupModule = dependencies('linagora.esn.group').lib.group;
  logger = dependencies('logger');
  clientModule = require('../../client')(dependencies);

  return {
    getStatus,
    sync
  };
};

function getStatus(group) {
  return q.all([
    groupModule.getAllMembers(group).then(members => members.map(groupModule.getMemberEmail)),
    clientModule.getGroupMembers(group.email)
  ])
  .spread((membersInMongo, membersInJames) => {
    const notAddedMembers = _.difference(membersInMongo, membersInJames);
    const notRemovedMembers = _.difference(membersInJames, membersInMongo);
    const ok = notAddedMembers.length === 0 && notRemovedMembers.length === 0;

    return {
      ok,
      notAddedMembers,
      notRemovedMembers
    };
  });
}

function sync(group) {
  return getStatus(group).then((status) => {
    if (status.ok) {
      return;
    }

    return q.all([
      clientModule.addGroupMembers(group.email, status.notAddedMembers),
      clientModule.removeGroupMembers(group.email, status.notRemovedMembers)
    ])
    .then(() => {
      logger.debug(`Synchronized members of group "${group.email}": added ${status.notAddedMembers.length} / removed ${status.notRemovedMembers.length} `);
    });
  });
}
