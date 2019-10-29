/**
 * Contains generic helper methods
 */

const _ = require('lodash')
const config = require('config')
const request = require('superagent')
const m2mAuth = require('tc-core-library-js').auth.m2m

const m2m = m2mAuth(_.pick(config, ['AUTH0_URL', 'AUTH0_AUDIENCE', 'TOKEN_CACHE_TIME', 'AUTH0_PROXY_SERVER_URL']))

/*
 * Function to get M2M token
 * @returns {Promise}
 */
const getM2Mtoken = async () => {
  return m2m.getMachineToken(config.AUTH0_CLIENT_ID, config.AUTH0_CLIENT_SECRET)
}

/**
 * Function to send request to API
 * @param{String} reqType Type of the request POST / PATCH / GET / DELETE
 * @param(String) path Complete path of the API URL
 * @param{Object} reqBody Body of the request
 * @returns {Promise}
 */
const reqToAPI = async (reqType, path, reqBody) => {
  return getM2Mtoken().then((token) => {
    switch (reqType) {
      case 'GET':
        return request
          .get(path)
          .set('Authorization', `Bearer ${token}`)
          .set('Content-Type', 'application/json')
      case 'POST':
        return request
          .post(path)
          .set('Authorization', `Bearer ${token}`)
          .set('Content-Type', 'application/json')
          .send(reqBody)
      case 'PATCH':
        return request
          .patch(path)
          .set('Authorization', `Bearer ${token}`)
          .set('Content-Type', 'application/json')
          .send(reqBody)
      case 'DELETE':
        return request
          .delete(path)
          .set('Authorization', `Bearer ${token}`)
          .set('Content-Type', 'application/json')
      default:
        throw new Error('Invalid request type')
    }
  })
}

module.exports = {
  reqToAPI
}
