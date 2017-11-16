'use strict';

const express = require('express');

module.exports = function(dependencies, lib) {

  const router = express.Router();

  require('./token')(dependencies, lib, router);
  require('./sync')(dependencies, lib, router);

  return router;
};
