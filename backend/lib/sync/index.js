module.exports = (dependencies) => {
  const group = require('./group')(dependencies);
  const domain = require('./domain')(dependencies);

  return {
    init,
    domain,
    group
  };

  function init() {
    domain.init();
    group.init();
  }
};
