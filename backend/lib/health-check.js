'use strict';

module.exports = dependencies => {
  const logger = dependencies('logger');
  const { registry, buildHealthyMessage, buildUnhealthyMessage, HealthCheckProvider } = dependencies('health-check');

  const SERVICE_NAME = 'james';

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

  /**
   * Check whether James web admin configuration on ESN is correct or not through testing its connection.
   * This function calls a health check API from James web admin and evaluates the connection status based on the received response.
   * James web admin health check API does not require authentication and has low operating cost, which is suitable for the connection test.
   * If the received response contains status field, James web admin has responded properly. Otherwise, something wrong has happened.
   * The reason for choosing the status field instead of the whole result is James web admin might have other responses such as 500: Internal Server Error, which should not be considered as healthy connection.
   * @param {function} client
   */
  function checkConnectionStatus(client) {
    return client.getHealthCheck().then(result => result && result.status);
  }
};
