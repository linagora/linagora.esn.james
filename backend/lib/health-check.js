'use strict';

module.exports = dependencies => {
  const logger = dependencies('logger');
  const { registry, buildHealthyMessage, buildUnhealthyMessage, HealthCheckProvider } = dependencies('health-check');

  const SERVICE_NAME = 'james';
  const HEALTHY_RESPONSE = 'healthy';

  return {
    register
  };

  /**
   * Register James as a HealthCheckProvider, takes James client as parameter.
   * @param {function} client
   */
  function register(client) {
    return registry.register(new HealthCheckProvider(SERVICE_NAME, () => checker(client)));
  }

  /**
   * Checks for James connection, then returns formatted result
   * @param {function} client
   */
  function checker(client) {
    const message = 'Health check: Something went wrong with James connection.';

    return checkConnectionStatus(client)
      .then(result => (result ? buildHealthyMessage(SERVICE_NAME) : buildUnhealthyMessage(SERVICE_NAME, message)))
      .catch(error => {
        logger.debug(message, error);

        return buildUnhealthyMessage(SERVICE_NAME, error.message || error || message);
      });
  }

  function checkConnectionStatus(client) {
    return client.getHealthCheck().then(result => result && result.status === HEALTHY_RESPONSE);
  }
};
