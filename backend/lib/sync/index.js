module.exports = (dependencies) => {
  const group = require('./group')(dependencies);

  return {
    init,
    group
  };

  function init() {
    group.init();
  }
};
