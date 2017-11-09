'use strict';

module.exports = function(dependencies) {
  const sync = require('./sync')(dependencies);
  const models = require('./db')(dependencies);

  return {
    init,
    models
  };

  function init() {
    sync.init();
  }
};
