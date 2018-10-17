/**
 * Test cases for Processor service
 */

const chai = require('chai')
const testHelper = require('./testHelper')
const service = require('../src/services/ProcessorService')
const testData = require('./testData')
const { Leaderboard } = require('../src/models')

chai.should()
chai.use(require('chai-as-promised'))

describe('Processor Service Tests', () => {
  // Clean database before and after execution
  before(async () => {
    await Leaderboard.deleteMany({})
    await Leaderboard.create({
      reviewSummationId: testData.updateMessage.payload.id,
      aggregateScore: testData.updateMessage.payload.aggregateScore
    })
    await Leaderboard.create({
      reviewSummationId: testData.deleteMessage.payload.id
    })
  })

  after(async () => {
    await Leaderboard.deleteMany({})
  })

  it('ProcessorService - null message', async () => {
    return service.upsert(null).should.be.rejectedWith('"message" must be an object')
  })

  it('ProcessorService - invalid message (missing topic)', async () => {
    const testMessage = {
      originator: 'originator',
      timestamp: '2018-01-02T00:00:00',
      'mime-type': 'application/json',
      payload: { abc: 123 }
    }
    return service.upsert(testMessage).should.be.rejectedWith('"topic" is required')
  })

  it('ProcessorService - invalid message (empty topic)', async () => {
    const testMessage = {
      topic: '',
      originator: 'originator',
      timestamp: '2018-01-02T00:00:00',
      'mime-type': 'application/json',
      payload: { abc: 123 }
    }
    return service.upsert(testMessage).should.be.rejectedWith('"topic" is not allowed to be empty')
  })

  it('ProcessorService - invalid message (missing originator)', async () => {
    const testMessage = {
      topic: 'test',
      timestamp: '2018-01-02T00:00:00',
      'mime-type': 'application/json',
      payload: { abc: 123 }
    }
    return service.upsert(testMessage).should.be.rejectedWith('"originator" is required')
  })

  it('ProcessorService - invalid message (missing timestamp)', async () => {
    const testMessage = {
      topic: 'test',
      originator: 'originator',
      'mime-type': 'application/json',
      payload: { abc: 123 }
    }
    return service.upsert(testMessage).should.be.rejectedWith('"timestamp" is required')
  })

  it('ProcessorService - invalid message (missing mime-type)', async () => {
    const testMessage = {
      topic: 'test',
      originator: 'originator',
      timestamp: '2018-01-02T00:00:00',
      payload: { abc: 123 }
    }
    return service.upsert(testMessage).should.be.rejectedWith('"mime-type" is required')
  })

  it('ProcessorService - invalid message (null payload)', async () => {
    const testMessage = {
      topic: 'test',
      originator: 'originator',
      timestamp: '2018-01-02T00:00:00',
      'mime-type': 'application/json',
      payload: null
    }
    return service.upsert(testMessage).should.be.rejectedWith('"payload" must be an object')
  })

  it('ProcessorService - Handle Insert message successfully', async () => {
    await service.upsert(testData.createMessage)
    const data = await testHelper.getById(testData.createMessage.payload.id)
    data.reviewSummationId.should.be.eql(testData.createMessage.payload.id)
    data.submissionId.should.be.eql(testData.createMessage.payload.submissionId)
    data.aggregateScore.should.be.eql(testData.createMessage.payload.aggregateScore)
  })

  it('ProcessorService - Handle update Message successfully', async () => {
    await service.upsert(testData.updateMessage)
    const data = await testHelper.getById(testData.updateMessage.payload.id)
    data.reviewSummationId.should.be.eql(testData.updateMessage.payload.id)
    data.aggregateScore.should.be.eql(testData.updateMessage.payload.aggregateScore)
  })

  it('ProcessorService - Handle delete Message successfully', async () => {
    await service.remove(testData.deleteMessage)
    return testHelper.getById(testData.deleteMessage.payload.id).should.eventually.eql(null)
  })
})
