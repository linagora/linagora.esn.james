module.exports = dependencies => {
  const group = require('./group')(dependencies);
  const domain = require('./domain')(dependencies);
  const user = require('./user')(dependencies);

  return {
    init,
    domain,
    group
  };

  function init() {
    domain.init();
    group.init();
    user.init();
  }
};
