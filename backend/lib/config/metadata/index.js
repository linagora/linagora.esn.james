module.exports = dependencies => ({
  configurations: {
    webadminApiFrontend: require('./webadminApiFrontend')(dependencies),
    webadminApiBackend: require('./webadminApiBackend')(dependencies)
  }
});
