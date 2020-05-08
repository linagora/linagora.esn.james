'use strict';

module.exports = function(dependencies) {
  const sync = require('./sync')(dependencies);
  const domain = require('./domain')(dependencies);
  const models = require('./db')(dependencies);
  const config = require('./config')(dependencies);
  const client = require('./client')(dependencies);
  const healthCheck = require('./health-check')(dependencies);

  return {
    init,
    client,
    sync,
    models,
    domain
  };

  function init() {
    sync.init();
    config.init();
    healthCheck.register(client);
  }
};
