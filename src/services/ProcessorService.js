/**
 * Service for Kafka processor.
 */

const config = require('config')
const joi = require('joi')
const logger = require('../common/logger')
const helper = require('../common/helper')

/**
 * Handle create / update topic messages from Kafka queue
 * @param {Object} message the Kafka message in JSON format
 */
async function upsert (message) {
  const submission = await helper.reqToAPI('GET', `${config.SUBMISSION_API_URL}/${message.payload.submissionId}`)
  const challengeId = submission.body.challengeId
  const memberId = submission.body.memberId
  const records = await helper.reqToAPI('GET', `${config.LEADERBOARD_API_URL}?challengeId=${challengeId}&memberId=${memberId}`)
  if (records.body.length === 0) {
    logger.debug(`Record with Challenge ID # ${challengeId} and Member ID # ${memberId} does not exists in database. Creating the record`)
    await helper.reqToAPI('POST', `${config.LEADERBOARD_API_URL}/challenge/${challengeId}/member/${memberId}`, message.payload)
  } else {
    logger.debug(`Record with Challenge ID # ${challengeId} and Member ID # ${memberId} exists in database. Updating the score`)
    await helper.reqToAPI('PATCH', `${config.LEADERBOARD_API_URL}/challenge/${challengeId}/member/${memberId}`, message.payload)
  }
}

upsert.schema = {
  message: joi.object().keys({
    topic: joi.string().required(),
    originator: joi.string().required(),
    timestamp: joi.date().required(),
    'mime-type': joi.string().required(),
    payload: joi.object().keys({
      submissionId: joi.string().required()
    }).unknown(true).required()
  }).required()
}

/**
 * Handle delete topic message from Kafka Queue
 * @param {Object} message the Kafka message in JSON format
 */
async function remove (message) {
  await helper.reqToAPI('DELETE', `${config.LEADERBOARD_API_URL}/reviewSummation/${message.payload.id}`)
}

remove.schema = {
  message: joi.object().keys({
    topic: joi.string().required(),
    originator: joi.string().required(),
    timestamp: joi.date().required(),
    'mime-type': joi.string().required(),
    payload: joi.object().keys({
      id: joi.string().required()
    }).unknown(true).required()
  }).required()
}

// Exports
module.exports = {
  upsert,
  remove
}

logger.buildService(module.exports)
