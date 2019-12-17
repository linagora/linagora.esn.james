'use strict';

const express = require('express');

module.exports = function(dependencies, lib) {

  const router = express.Router();

  require('./token')(dependencies, lib, router);
  require('./sync')(dependencies, lib, router);
  require('./domain')(dependencies, lib, router);
  require('./quota')(dependencies, lib, router);
  require('./dlp')(dependencies, lib, router);

  return router;
};
