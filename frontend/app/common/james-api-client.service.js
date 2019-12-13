(function(angular) {
  'use strict';

  angular.module('linagora.esn.james')
    .factory('jamesApiClient', jamesApiClient);

  function jamesApiClient(jamesRestangular) {
    return {
      addDomainAlias: addDomainAlias,
      generateJwtToken: generateJwtToken,
      getDomainAliases: getDomainAliases,
      getDomainQuota: getDomainQuota,
      getDomainsSyncStatus: getDomainsSyncStatus,
      getGroupSyncStatus: getGroupSyncStatus,
      getPlatformQuota: getPlatformQuota,
      getUserQuota: getUserQuota,
      listJamesDomains: listJamesDomains,
      removeDomainAlias: removeDomainAlias,
      setDomainQuota: setDomainQuota,
      setPlatformQuota: setPlatformQuota,
      setUserQuota: setUserQuota,
      syncGroup: syncGroup,
      syncDomains: syncDomains
    };

    /**
     * Generate JWT to authenticate against James Webadmin APIs
     * @param  {String} domainId - (optional) The domain ID if the logged in user
     *                             is domain aministrator. Omit this if the logged
     *                             in user is platform administrator.
     * @return {Promise}          - On success, resolves with the response containing the token
     */
    function generateJwtToken(domainId) {
      return jamesRestangular.one('token').post(null, null, { domain_id: domainId });
    }

    /**
     * Get synchronization status of a group
     * @param  {String} groupId - The group ID
     * @return {Promise}         - On success, resolves with the response containing the status
     */
    function getGroupSyncStatus(groupId) {
      return jamesRestangular.one('sync').one('groups', groupId).get();
    }

    /**
     * Re-synchronize a group
     * @param  {String} groupId - The group ID
     * @return {Promise}        - Resolve empty response on success
     */
    function syncGroup(groupId) {
      return jamesRestangular.one('sync').one('groups', groupId).post();
    }

    /**
     * Get aliases of a particular domain
     * @param  {String} domainId - The domain ID
     * @return {Promise}         - On success, resolves with the list of domain aliases
     */
    function getDomainAliases(domainId) {
      return jamesRestangular.one('domains', domainId).one('aliases').get().then(function(response) {
        return response.data;
      });
    }

    /**
     * Add domain alias
     * @param  {String} domainId - The domain ID
     * @param  {String} alias    - The alias to add
     * @return {Promise}         - Resolve empty response on success
     */
    function addDomainAlias(domainId, alias) {
      return jamesRestangular.one('domains', domainId).one('aliases', alias).post();
    }

    /**
     * Remove domain alias
     * @param  {String} domainId - The domain ID
     * @param  {String} alias    - The alias to remove
     * @return {Promise}         - Resolve empty response on success
     */
    function removeDomainAlias(domainId, alias) {
      return jamesRestangular.one('domains', domainId).one('aliases', alias).remove();
    }

    /**
     * Get synchronization status of domains
     * @return {Promise}        - Resolve empty response on success
     */
    function getDomainsSyncStatus() {
      return jamesRestangular.one('sync').one('domains').get();
    }

    /**
     * Re-synchronize domains
     * @return {Promise}        - Resolve empty response on success
     */
    function syncDomains() {
      return jamesRestangular.one('sync').one('domains').post();
    }

    /**
     * List domains from James
     * @return {Promise}          - On success, resolves with the list of James domains
     */
    function listJamesDomains() {
      return jamesRestangular.one('domains').get()
        .then(function(response) {
          return response.data;
        });
    }

    /**
     * Get quota for a particular domain
     * @param {String} domainId target domain ID
     * @return {Promise} - On success, resolves with the quota of the domain
     */
    function getDomainQuota(domainId) {
      return jamesRestangular.all('quota').customGET('', { scope: 'domain', domain_id: domainId })
        .then(function(response) {
          return response.data;
        });
    }

    /**
     * Get platform quota
     * @return {Promise} - On success, resolves with platform quota
     */
    function getPlatformQuota() {
      return jamesRestangular.all('quota').customGET('', { scope: 'platform' })
        .then(function(response) {
          return response.data;
        });
    }

    /**
     * Get quota for a particular user
     * @param {String} domainId target domain ID which target user belongs to
     * @param {String} userId target user ID
     * @return {Promise} - On success, resolves with the quota of the user
     */
    function getUserQuota(domainId, userId) {
      return jamesRestangular.all('quota').get('', {
        scope: 'user',
        domain_id: domainId,
        user_id: userId
      })
        .then(function(response) {
          return response.data;
        });
    }

    /**
     * Set quota for a particular domain
     * @param {String} domainId target domain ID
     * @param {Object} quota Contains count and size
     * Remove quota count/size if its value is null
     * Set quota count/size to unlimited if its value is -1
     * @return {Promise} - Resolve on success
     */
    function setDomainQuota(domainId, quota) {
      return jamesRestangular.all('quota').customPUT(quota, '', { domain_id: domainId, scope: 'domain' });
    }

    /**
     * Set platform quota
     * @param {Object} quota Contains count and size
     * Remove quota count/size if its value is null
     * Set quota count/size to unlimited if its value is -1
     * @return {Promise} - Resolve on success
     */
    function setPlatformQuota(quota) {
      return jamesRestangular.all('quota').customPUT(quota, '', { scope: 'platform' });
    }

    /**
     * Set quota for a particular user
     * @param {String} domainId target domain ID which target user belongs to
     * @param {String} userId target user ID
     * @param {Object} quota Contains count and size
     * Remove quota count/size if its value is null
     * Set quota count/size to unlimited if its value is -1
     * @return {Promise} - Resolve on success
     */
    function setUserQuota(domainId, userId, quota) {
      return jamesRestangular.all('quota').customPUT(quota, '', { domain_id: domainId, user_id: userId, scope: 'user' });
    }
  }
})(angular);
