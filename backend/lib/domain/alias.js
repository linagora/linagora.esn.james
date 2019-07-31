module.exports = dependencies => {
  const client = require('../client')(dependencies);
  const logger = dependencies('logger');

  return {
    addDomainAliases,
    getDomainAliases,
    removeDomainAliases
  };

  function addDomainAliases(domain, aliases) {
    if (!domain) {
      return Promise.reject(new Error('domain cannot be null'));
    }

    if (!aliases) {
      return Promise.reject(new Error('alias(es) cannot be null'));
    }

    const domainName = domain.name || domain;

    if (typeof domainName !== 'string') {
      return Promise.reject(new Error('domain name must be a string'));
    }

    if (typeof aliases === 'string') {
      aliases = [aliases];
    }

    if (!Array.isArray(aliases)) {
      return Promise.reject(new Error('alias(es) must be either string or array'));
    }

    return client.addDomainAliases(domainName, aliases).catch(_handleClientError);
  }

  function getDomainAliases(domain) {
    if (!domain) {
      return Promise.reject(new Error('domain cannot be null'));
    }

    const domainName = domain.name || domain;

    if (typeof domainName !== 'string') {
      return Promise.reject(new Error('domain name must be a string'));
    }

    return client.listDomainAliases(domainName).catch(_handleClientError);
  }

  function removeDomainAliases(domain, aliases) {
    if (!domain) {
      return Promise.reject(new Error('domain cannot be null'));
    }

    if (!aliases) {
      return Promise.reject(new Error('alias(es) cannot be null'));
    }

    const domainName = domain.name || domain;

    if (typeof domainName !== 'string') {
      return Promise.reject(new Error('domain name must be a string'));
    }

    if (typeof aliases === 'string') {
      aliases = [aliases];
    }

    if (!Array.isArray(aliases)) {
      return Promise.reject(new Error('alias(es) must be either string or array'));
    }

    return client.removeDomainAliases(domainName, aliases).catch(_handleClientError);
  }

  function _handleClientError(error) {
    if (error && error.response && error.response.data) {
      logger.error('Error from James', error.response.data);
    }

    return Promise.reject(error);
  }
};
