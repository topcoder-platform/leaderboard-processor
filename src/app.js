/**
 * The application entry point
 */

require('./bootstrap')
const config = require('config')
const logger = require('./common/logger')
const Kafka = require('no-kafka')
const healthcheck = require('topcoder-healthcheck-dropin')
const ProcessorService = require('./services/ProcessorService')
const helper = require('./common/helper')

// start Kafka consumer
logger.info('Start Kafka consumer.')
// create consumer
const options = { connectionString: config.KAFKA_URL, groupId: config.KAFKA_GROUP_ID }
if (config.KAFKA_CLIENT_CERT && config.KAFKA_CLIENT_CERT_KEY) {
  options.ssl = { cert: config.KAFKA_CLIENT_CERT, key: config.KAFKA_CLIENT_CERT_KEY }
}
const consumer = new Kafka.GroupConsumer(options)

// data handler
const dataHandler = (messageSet, topic, partition) => Promise.each(messageSet, async (m) => {
  const message = m.message.value.toString('utf8')
  logger.info(`Handle Kafka event message; Topic: ${topic}; Partition: ${partition}; Offset: ${
    m.offset}; Message: ${message}.`)
  let messageJSON

  try {
    messageJSON = JSON.parse(message)
  } catch (e) {
    logger.error('Invalid message JSON.')
    logger.logFullError(e)
    // ignore the message
    return
  }

  if (messageJSON.topic !== topic) {
    logger.error(`The message topic ${messageJSON.topic} doesn't match the Kafka topic ${topic}.`)
    // ignore the message
    return
  }

  if (messageJSON.payload.resource !== 'review' && messageJSON.payload.resource !== 'reviewSummation') {
    logger.debug(`Ignoring Non review payloads from topic ${messageJSON.topic}.`)
    // ignore the message
    return
  }

  if (messageJSON.payload.resource === 'review') {
    const avScanTypeId = await helper.getreviewTypeId(config.AV_SCAN_NAME)

    if (messageJSON.payload.typeId === avScanTypeId) {
      logger.debug(`Ignoring AV Scan reviews from topic ${messageJSON.topic}`)
      return false
    }
  }

  return (async () => {
    switch (topic) {
      case config.CREATE_DATA_TOPIC:
        await ProcessorService.upsert(messageJSON)
        break
      case config.UPDATE_DATA_TOPIC:
        await ProcessorService.upsert(messageJSON)
        break
      case config.DELETE_DATA_TOPIC:
        await ProcessorService.remove(messageJSON)
        break
      default:
        throw new Error(`Invalid topic: ${topic}`)
    }
  })()
    // commit offset regardless of error
    .then(() => logger.debug('Successfully processed message'))
    .catch((err) => logger.logFullError(err))
    .finally(() => consumer.commitOffset({ topic, partition, offset: m.offset }))
})

// check if there is kafka connection alive
function check () {
  if (!consumer.client.initialBrokers && !consumer.client.initialBrokers.length) {
    return false
  }
  let connected = true
  consumer.client.initialBrokers.forEach(conn => {
    logger.debug(`url ${conn.server()} - connected=${conn.connected}`)
    connected = conn.connected & connected
  })
  return connected
}

const topics = [config.CREATE_DATA_TOPIC, config.UPDATE_DATA_TOPIC, config.DELETE_DATA_TOPIC]

consumer
  .init([{
    subscriptions: topics,
    handler: dataHandler
  }])
  // consume configured topics
  .then(() => {
    logger.info('Initialized.......')
    healthcheck.init([check])
    logger.info('Adding topics successfully.......')
    logger.info(topics)
    logger.info('Kick Start.......')
  })
  .catch((err) => logger.error(err))

if (process.env.NODE_ENV === 'test') {
  module.exports = consumer
}
