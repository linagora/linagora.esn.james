module.exports = (dependencies) => {
  const group = require('./group')(dependencies);

  return {
    init
  };

  function init() {
    group.init();
  }
};
