'use strict';

module.exports = function() {
  return {
    get
  };

  function get(req, res) {
    res.send('Hello World!');
  }

};
