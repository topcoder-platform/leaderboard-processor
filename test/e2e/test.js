/**
 * E2E test of the legacy groups Processor.
 */

process.env.NODE_ENV = 'test'
require('../../src/bootstrap')
const _ = require('lodash')
const config = require('config')
const expect = require('chai').expect
const Kafka = require('no-kafka')
const request = require('superagent')
const logger = require('../../src/common/logger')
const { testTopics } = require('../common/testData')

describe('Topcoder - Leaderboard Processor E2E Test', () => {
  let app
  let infoLogs = []
  let errorLogs = []
  let debugLogs = []
  const info = logger.info
  const error = logger.error
  const debug = logger.debug

  const options = { connectionString: config.KAFKA_URL, groupId: config.KAFKA_GROUP_ID }
  if (config.KAFKA_CLIENT_CERT && config.KAFKA_CLIENT_CERT_KEY) {
    options.ssl = { cert: config.KAFKA_CLIENT_CERT, key: config.KAFKA_CLIENT_CERT_KEY }
  }
  const producer = new Kafka.Producer(options)

  /**
   * Sleep with time from input
   * @param time the time input
   */
  async function sleep (time) {
    await new Promise((resolve) => {
      setTimeout(resolve, time)
    })
  }

  /**
   * Send message
   * @param testMessage the test message
   */
  const sendMessage = async (testMessage) => {
    await producer.send({
      topic: testMessage.topic,
      message: {
        value: JSON.stringify(testMessage)
      }
    })
  }

  /**
   * Consume not committed messages before e2e test
   */
  const consumeMessages = async () => {
    // remove all not processed messages
    const consumer = new Kafka.GroupConsumer(options)
    await consumer.init([{
      subscriptions: [config.CREATE_DATA_TOPIC, config.UPDATE_DATA_TOPIC, config.DELETE_DATA_TOPIC],
      handler: (messageSet, topic, partition) => Promise.each(messageSet,
        (m) => consumer.commitOffset({ topic, partition, offset: m.offset }))
    }])
    // make sure process all not committed messages before test
    await sleep(config.WAIT_TIME)
    await consumer.end()
  }

  /**
   * Wait job finished with successful log or error log is found
   */
  const waitJob = async () => {
    while (true) {
      if (errorLogs.length > 0) {
        break
      }
      if (debugLogs.some(x => String(x).includes('Successfully processed message'))) {
        break
      }
      if (debugLogs.some(x => String(x).includes('Ignoring'))) {
        break
      }
      // use small time to wait job and will use global timeout so will not wait too long
      await sleep(config.WAIT_TIME)
    }
  }

  const assertErrorMessage = (message) => {
    expect(errorLogs.length).to.be.above(0)
    expect(errorLogs.some(x => String(x).includes(message))).to.equal(true)
  }

  before(async () => {
    // inject logger with log collector
    logger.info = (message) => {
      infoLogs.push(message)
      info(message)
    }
    logger.debug = (message) => {
      debugLogs.push(message)
      debug(message)
    }
    logger.error = (message) => {
      errorLogs.push(message)
      error(message)
    }
    await consumeMessages()
    // start kafka producer
    await producer.init()
    // start the application (kafka listener)
    app = require('../../src/app')
    // wait until consumer init successfully
    while (true) {
      if (infoLogs.some(x => String(x).includes('Kick Start'))) {
        break
      }
      await sleep(config.WAIT_TIME)
    }
  })

  after(async () => {
    // restore logger
    logger.error = error
    logger.info = info
    logger.debug = debug

    try {
      await producer.end()
    } catch (err) {
      // ignore
    }
    try {
      await app.end()
    } catch (err) {
      // ignore
    }
  })

  beforeEach(() => {
    // clear logs
    infoLogs = []
    debugLogs = []
    errorLogs = []
  })

  it('Should setup healthcheck with check on kafka connection', async () => {
    const healthcheckEndpoint = `http://localhost:${process.env.PORT || 3000}/health`
    let result = await request.get(healthcheckEndpoint)
    expect(result.status).to.equal(200)
    expect(result.body).to.deep.equal({ checksRun: 1 })
  })

  it('Should handle invalid json message', async () => {
    const { testMessage } = testTopics.create
    await producer.send({
      topic: testMessage.topic,
      message: {
        value: '[ invalid'
      }
    })
    await waitJob()
    expect(errorLogs[0]).to.equal('Invalid message JSON.')
  })

  it('Should handle incorrect topic field message', async () => {
    const { testMessage } = testTopics.create
    let message = _.cloneDeep(testMessage)
    message.topic = 'invalid'
    await producer.send({
      topic: testMessage.topic,
      message: {
        value: JSON.stringify(message)
      }
    })
    await waitJob()
    expect(errorLogs[0]).to.equal('The message topic invalid doesn\'t match the Kafka topic submission.notification.create.')
  })

  it('processor create leaderboard success', async () => {
    await sendMessage(testTopics.create.testMessage)
    await waitJob()

    expect(errorLogs.length).to.equal(0)
    expect(debugLogs[debugLogs.length - 4]).to.equal('Record with Challenge ID # 30051825 and Member ID # 8547899 does not exists in database. Creating the record')
    expect(debugLogs[debugLogs.length - 3]).to.equal('EXIT upsert')
    expect(debugLogs[debugLogs.length - 2]).to.equal('output arguments')
    expect(debugLogs[debugLogs.length - 1]).to.equal('Successfully processed message')
  })

  it('processor update leaderboard success', async () => {
    await sendMessage(testTopics.update.testMessage)
    await waitJob()

    expect(errorLogs.length).to.equal(0)
    expect(debugLogs[debugLogs.length - 4]).to.equal('Record with Challenge ID # 30051825 and Member ID # 22688726 exists in database. Updating the score')
    expect(debugLogs[debugLogs.length - 3]).to.equal('EXIT upsert')
    expect(debugLogs[debugLogs.length - 2]).to.equal('output arguments')
    expect(debugLogs[debugLogs.length - 1]).to.equal('Successfully processed message')
  })

  it('processor delete leaderboard success', async () => {
    await sendMessage(testTopics.delete.testMessage)
    await waitJob()

    expect(errorLogs.length).to.equal(0)
    expect(debugLogs[debugLogs.length - 3]).to.equal('EXIT remove')
    expect(debugLogs[debugLogs.length - 2]).to.equal('output arguments')
    expect(debugLogs[debugLogs.length - 1]).to.equal('Successfully processed message')
  })

  it('processor create leaderboard fail', async () => {
    let message = _.cloneDeep(testTopics.create.testMessage)
    message.payload.submissionId = 'a34e1158-2c27-4d38-b079-5e5cca1bdcf9'
    await sendMessage(message)
    await waitJob()

    expect(errorLogs.length).to.above(0)
  })

  it('processor ignore message with different resource', async () => {
    let message = _.cloneDeep(testTopics.delete.testMessage)
    message.payload.resource = 'submission'
    await sendMessage(message)
    await waitJob()

    expect(errorLogs.length).to.equal(0)
    expect(debugLogs[debugLogs.length - 1]).to.equal(`Ignoring Non review Summation payloads from topic ${message.topic}.`)
  })

  for (const op of ['create', 'update', 'delete']) {
    let { requiredFields, stringFields, testMessage } = testTopics[op]

    for (const requiredField of requiredFields) {
      if (requiredField !== 'topic') {
        it(`test invalid parameters, required field ${requiredField} is missing`, async () => {
          let message = _.cloneDeep(testMessage)
          message = _.omit(message, requiredField)
          await sendMessage(message)
          await waitJob()

          assertErrorMessage(`"${_.last(requiredField.split('.'))}" is required`)
        })
      }
    }

    for (const stringField of stringFields) {
      if (stringField !== 'topic') {
        it(`test invalid parameters, invalid string type field ${stringField}`, async () => {
          let message = _.cloneDeep(testMessage)
          _.set(message, stringField, 123)
          await sendMessage(message)
          await waitJob()

          assertErrorMessage(`"${_.last(stringField.split('.'))}" must be a string`)
        })
      }
    }
  }
})
