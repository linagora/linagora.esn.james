'use strict';

let logger;
let syncModule;

module.exports = function(dependencies, lib) {
  logger = dependencies('logger');
  syncModule = lib.sync;

  return {
    getGroupSyncStatus,
    syncGroup
  };
};

function getGroupSyncStatus(req, res) {
  const group = req.group;

  syncModule.group.getStatus(group).then((result) => {
    res.status(200).json(result);
  })
  .catch((err) => {
    const details = `Error while getting group synchronize status "${group.id}"`;

    logger.error(details, err);

    return res.status(500).json({
      error: {
        code: 500,
        message: 'Server Error',
        details
      }
    });
  });
}

function syncGroup(req, res) {
  const group = req.group;

  syncModule.group.sync(group).then(() => {
    res.status(204).end();
  })
  .catch((err) => {
    const details = `Error while synchronizing group "${group.id}"`;

    logger.error(details, err);

    return res.status(500).json({
      error: {
        code: 500,
        message: 'Server Error',
        details
      }
    });
  });
}
