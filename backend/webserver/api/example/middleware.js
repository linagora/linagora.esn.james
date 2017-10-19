'use strict';

module.exports = () => {
  return {
    canGet
  };

  function canGet(req, res, next) {
    next();
  }
};
