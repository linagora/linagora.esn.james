const { EVENTS } = require('../constants');

module.exports = dependencies => {
  const logger = dependencies('logger');
  const pubsub = dependencies('pubsub').local;
  const { sync } = require('./synchronizer')(dependencies);

  return {
    init
  };

  function init() {
    logger.info('Start listening on user events');
    pubsub.topic(EVENTS.USER_UPDATED).subscribe(_onUserUpdated);
  }

  function _onUserUpdated(updatedUser) {
    return sync(updatedUser);
  }
};
