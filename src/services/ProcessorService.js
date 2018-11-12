/**
 * Service for Kafka processor.
 */

const config = require('config')
const joi = require('joi')
const logger = require('../common/logger')
const helper = require('../common/helper')
const { Leaderboard } = require('../models')

/**
 * Handle create / update topic messages from Kafka queue
 * @param {Object} message the Kafka message in JSON format
 */
const upsert = async (message) => {
  // const existRecord = await Leaderboard.findOne({$and: [{challengeId: }]})

  const submission = await helper.reqToAPI(`${config.SUBMISSION_API_URL}/${message.payload.submissionId}`)
  const challengeDetail = await helper.reqToAPI(`${config.CHALLENGE_API_URL}?filter=id=${submission.body.challengeId}`)
  
  // const existRecord = await Leaderboard.findOne({ reviewSummationId: message.payload.id })
  const existRecord = await Leaderboard.findOne({$and: [{challengeId: submission.body.challengeId}, {memberId: submission.body.memberId}]})

  if (existRecord) {
    logger.debug(`Record with ID # ${message.payload.id} exists in database. Updating the score`)
    await Leaderboard.updateOne(
      {
        _id: existRecord._id
      },
      {
        $set: { 
          aggregateScore: message.payload.aggregateScore,
          reviewSummationId: message.payload.id
        }
      }
    )
  } else {
    logger.debug(`Record with ID # ${message.payload.id} does not exists in database. Creating the record`)
    // const submission = await helper.reqToAPI(`${config.SUBMISSION_API_URL}/${message.payload.submissionId}`)
    // const challengeDetail = await helper.reqToAPI(`${config.CHALLENGE_API_URL}?filter=id=${submission.body.challengeId}`)

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
      aggregateScore: message.payload.aggregateScore
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
