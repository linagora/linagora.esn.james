'use strict';

module.exports = function(dependencies) {
  const sync = require('./sync')(dependencies);
  const models = require('./db')(dependencies);
  const config = require('./config')(dependencies);

  return {
    init,
    sync,
    models
  };

  function init() {
    sync.init();
    config.init();
  }
};
