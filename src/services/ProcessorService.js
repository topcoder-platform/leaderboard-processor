/**
 * Service for Kafka processor.
 */

const config = require('config')
const joi = require('joi')
const logger = require('../common/logger')
const helper = require('../common/helper')
const { Leaderboard } = require('../models')

/**
 * Returns the tests passed using the metadata information
 * @param {object} metadata the object from which to retrieve the tests passed
 */
function getTestsPassed (metadata = {}) {
  const tests = metadata.tests || {}

  let testsPassed = tests.total - tests.pending - tests.failed

  if (!testsPassed) {
    testsPassed = 0
  }

  return testsPassed
}

/**
 * Handle create / update topic messages from Kafka queue
 * @param {Object} message the Kafka message in JSON format
 */
const upsert = async (message) => {
  const submission = await helper.reqToAPI(`${config.SUBMISSION_API_URL}/${message.payload.submissionId}`)
  
  const existRecord = await Leaderboard.findOne({$and: [{challengeId: submission.body.challengeId}, {memberId: submission.body.memberId}]})

  const reviewSummation = await helper.reqToAPI(`${config.REVIEW_SUMMATION_API_URL}/${message.payload.id}`)

  let testsPassed

  if (reviewSummation.metadata) {
    testsPassed = getTestsPassed(reviewSummation.metadata)
  } else {
    testsPassed = 0
  }

  if (existRecord) {
    logger.debug(`Record with ID # ${message.payload.id} exists in database. Updating the score`)
    await Leaderboard.updateOne(
      {
        _id: existRecord._id
      },
      {
        $set: { 
          aggregateScore: message.payload.aggregateScore,
          reviewSummationId: message.payload.id,
          testsPassed
        }
      }
    )
  } else {
    logger.debug(`Record with ID # ${message.payload.id} does not exists in database. Creating the record`)
    const challengeDetail = await helper.reqToAPI(`${config.CHALLENGE_API_URL}?filter=id=${submission.body.challengeId}`)

    if (!helper.isGroupIdValid(challengeDetail.body.result.content[0].groupIds)) {
      logger.debug(`Group ID of Challenge # ${submission.body.challengeId} is not configured for processing!`)
      // Ignore the message
      return
    }

    const memberDetail = await helper.reqToAPI(`${config.MEMBER_API_URL}?filter=id=${submission.body.memberId}`)

    // Record to be written into MongoDB
    const record = {
      reviewSummationId: message.payload.id,
      submissionId: message.payload.submissionId,
      memberId: submission.body.memberId,
      challengeId: submission.body.challengeId,
      handle: memberDetail.body.result.content[0].handle,
      aggregateScore: message.payload.aggregateScore,
      testsPassed
    }

    await Leaderboard.create(record)
  }
}

upsert.schema = {
  message: joi.object().keys({
    topic: joi.string().required(),
    originator: joi.string().required(),
    timestamp: joi.date().required(),
    'mime-type': joi.string().required(),
    payload: joi.object().required()
  }).required()
}

/**
 * Handle delete topic message from Kafka Queue
 * @param {Object} message the Kafka message in JSON format
 */
const remove = async (message) => {
  // Remove the record from MongoDB
  await Leaderboard.deleteOne({ reviewSummationId: message.payload.id })
}

remove.schema = {
  message: joi.object().keys({
    topic: joi.string().required(),
    originator: joi.string().required(),
    timestamp: joi.date().required(),
    'mime-type': joi.string().required(),
    payload: joi.object().required()
  }).required()
}

// Exports
module.exports = {
  upsert,
  remove
}

logger.buildService(module.exports)
