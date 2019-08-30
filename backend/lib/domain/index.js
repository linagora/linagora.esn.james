module.exports = dependencies => {
  const client = require('../client')(dependencies);

  return {
    alias: require('./alias')(dependencies),
    listDomains
  };

  function listDomains() {
    return client.listDomains();
  }
};
