/**
 * Unit tests of the Leaderboard Processor.
 */

process.env.NODE_ENV = 'test'
require('../../src/bootstrap')
const _ = require('lodash')
const expect = require('chai').expect
const logger = require('../../src/common/logger')
const ProcessorService = require('../../src/services/ProcessorService')
const { testTopics } = require('../common/testData')

describe('Topcoder - Leaderboard Processor Unit Test', () => {
  let infoLogs = []
  let errorLogs = []
  let debugLogs = []
  const info = logger.info
  const error = logger.error
  const debug = logger.debug

  /**
   * Assert validation error
   * @param err the error
   * @param message the message
   */
  const assertValidationError = (err, message) => {
    expect(err.isJoi).to.equal(true)
    expect(err.name).to.equal('ValidationError')
    expect(err.details.map(x => x.message)).to.include(message)
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
  })

  after(async () => {
    // restore logger
    logger.error = error
    logger.info = info
    logger.debug = debug
  })

  beforeEach(() => {
    // clear logs
    infoLogs = []
    debugLogs = []
    errorLogs = []
  })

  it('processor create leaderboard success', async () => {
    await ProcessorService.upsert(testTopics.create.testMessage)
    expect(errorLogs.length).to.equal(0)
    expect(debugLogs[debugLogs.length - 3]).to.equal('Record with Challenge ID # 30051825 and Member ID # 8547899 does not exists in database. Creating the record')
    expect(debugLogs[debugLogs.length - 2]).to.equal('EXIT upsert')
    expect(debugLogs[debugLogs.length - 1]).to.equal('output arguments')
  })

  it('processor update leaderboard success', async () => {
    await ProcessorService.upsert(testTopics.update.testMessage)
    expect(errorLogs.length).to.equal(0)
    expect(debugLogs[debugLogs.length - 3]).to.equal('Record with Challenge ID # 30051825 and Member ID # 22688726 exists in database. Updating the score')
    expect(debugLogs[debugLogs.length - 2]).to.equal('EXIT upsert')
    expect(debugLogs[debugLogs.length - 1]).to.equal('output arguments')
  })

  it('processor delete leaderboard success', async () => {
    await ProcessorService.remove(testTopics.delete.testMessage)
    expect(errorLogs.length).to.equal(0)
    expect(debugLogs[debugLogs.length - 2]).to.equal('EXIT remove')
    expect(debugLogs[debugLogs.length - 1]).to.equal('output arguments')
  })

  for (const op of ['create', 'update', 'delete']) {
    let { requiredFields, stringFields, testMessage } = testTopics[op]

    for (const requiredField of requiredFields) {
      if (requiredField !== 'topic') {
        it(`test invalid parameters, required field ${requiredField} is missing`, async () => {
          let message = _.cloneDeep(testMessage)
          message = _.omit(message, requiredField)
          try {
            if (op === 'delete') {
              await ProcessorService.remove(message)
            } else {
              await ProcessorService.upsert(message)
            }
            throw new Error('should not throw error here')
          } catch (err) {
            assertValidationError(err, `"${_.last(requiredField.split('.'))}" is required`)
          }
        })
      }
    }

    for (const stringField of stringFields) {
      it(`test invalid parameters, invalid string type field ${stringField}`, async () => {
        let message = _.cloneDeep(testMessage)
        _.set(message, stringField, 123)
        try {
          if (op === 'delete') {
            await ProcessorService.remove(message)
          } else {
            await ProcessorService.upsert(message)
          }
          throw new Error('should not throw error here')
        } catch (err) {
          assertValidationError(err, `"${_.last(stringField.split('.'))}" must be a string`)
        }
      })
    }
  }
})
