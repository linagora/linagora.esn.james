'use strict';

let groupModule;
let logger;

module.exports = function(dependencies) {
  groupModule = dependencies('linagora.esn.group').lib.group;
  logger = dependencies('logger');

  return {
    loadGroup
  };
};

function loadGroup(req, res, next) {
  const groupId = req.params.groupId;

  groupModule.getById(groupId)
  .then((group) => {
    if (group) {
      req.group = group;

      return next();
    }

    res.status(404).json({
      error: {
        code: 404,
        message: 'Not Found',
        details: `No such group: "${groupId}"`
      }
    });
  })
  .catch((err) => {
    const details = `Error while loading group "${groupId}"`;

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
