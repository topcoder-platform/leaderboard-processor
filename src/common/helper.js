/**
 * Contains generic helper methods
 */

const config = require('config')
const _ = require('lodash')
const request = require('superagent')
const m2mAuth = require('tc-core-library-js').auth.m2m

const m2m = m2mAuth(_.pick(config, ['AUTH0_URL', 'AUTH0_AUDIENCE', 'TOKEN_CACHE_TIME', 'AUTH0_PROXY_SERVER_URL']))

/*
 * Check if the Group ID is configured to be processed
 * @param {String []} groupIds Array of group ID
 * @returns {Boolean} True if any one of the Group ID is present in config
 */
const isGroupIdValid = (groupIds) => {
  // Get the Group IDs from config
  const confGroupIds = config.GROUP_IDS.split(',')
  if (_.intersectionBy(confGroupIds, groupIds, parseInt).length !== 0) {
    return true
  }
  return false
}

/*
 * Function to get M2M token
 * @returns {Promise}
 */
const getM2Mtoken = async () => {
  return m2m.getMachineToken(config.AUTH0_CLIENT_ID, config.AUTH0_CLIENT_SECRET)
}

/*
 * Send GET request to any API with M2M token
 * @param {String} path HTTP URL
 * @returns {Promise}
 */
const reqToAPI = async (path) => {
  const token = await getM2Mtoken()
  return request
    .get(path)
    .set('Authorization', `Bearer ${token}`)
    .set('Content-Type', 'application/json')
}

module.exports = {
  isGroupIdValid,
  reqToAPI
}
