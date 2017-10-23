'use strict';

const AwesomeModule = require('awesome-module');
const Dependency = AwesomeModule.AwesomeModuleDependency;
const path = require('path');
const glob = require('glob-all');
const FRONTEND_JS_PATH = __dirname + '/frontend/app/';
const MODULE_NAME = 'james';
const AWESOME_MODULE_NAME = `linagora.esn.${MODULE_NAME}`;

const awesomeModule = new AwesomeModule(AWESOME_MODULE_NAME, {
  dependencies: [
    new Dependency(Dependency.TYPE_NAME, 'linagora.esn.core.logger', 'logger'),
    new Dependency(Dependency.TYPE_NAME, 'linagora.esn.core.webserver.wrapper', 'webserver-wrapper'),
    new Dependency(Dependency.TYPE_NAME, 'linagora.esn.core.db', 'db'),
    new Dependency(Dependency.TYPE_NAME, 'linagora.esn.core.webserver.middleware.authorization', 'authorizationMW'),
    new Dependency(Dependency.TYPE_NAME, 'linagora.esn.core.i18n', 'i18n'),
    new Dependency(Dependency.TYPE_NAME, 'linagora.esn.core.webserver.middleware.platformadmins', 'platformadminsMW'),
    new Dependency(Dependency.TYPE_NAME, 'linagora.esn.core.auth', 'auth')
  ],

  states: {
    lib: function(dependencies, callback) {
      const moduleLib = require('./backend/lib')(dependencies);
      const module = require('./backend/webserver/api')(dependencies, moduleLib);

      const lib = {
        api: {
          module: module
        },
        lib: moduleLib
      };

      return callback(null, lib);
    },

    deploy: function(dependencies, callback) {
      const webserverWrapper = dependencies('webserver-wrapper');
      const app = require('./backend/webserver/application')(dependencies, this);

      // Register every exposed endpoints
      app.use('/api', this.api.module);

      const frontendJsFilesFullPath = glob.sync([
        FRONTEND_JS_PATH + '**/*.module.js',
        FRONTEND_JS_PATH + '**/!(*spec).js'
      ]);

      const frontendJsFilesUri = frontendJsFilesFullPath.map(filepath => filepath.replace(FRONTEND_JS_PATH, ''));

      webserverWrapper.injectAngularAppModules(MODULE_NAME, frontendJsFilesUri, AWESOME_MODULE_NAME, ['esn'], {
        localJsFiles: frontendJsFilesFullPath
      });
      const lessFile = path.resolve(__dirname, './frontend/app/app.less');

      webserverWrapper.injectLess(MODULE_NAME, [lessFile], 'esn');
      webserverWrapper.addApp(MODULE_NAME, app);

      return callback();
    }
  }
});

module.exports = awesomeModule;
