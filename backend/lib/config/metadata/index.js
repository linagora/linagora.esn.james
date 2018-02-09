module.exports = dependencies => ({
  rights: {
    padmin: 'rw'
  },
  configurations: {
    webadminApiFrontend: require('./webadminApiFrontend')(dependencies),
    webadminApiBackend: require('./webadminApiBackend')(dependencies)
  }
});
