module.exports = dependencies => ({
  configurations: {
    deletedMessages: require('./deletedMessages')(dependencies),
    webadminApiFrontend: require('./webadminApiFrontend')(dependencies),
    webadminApiBackend: require('./webadminApiBackend')(dependencies)
  }
});
