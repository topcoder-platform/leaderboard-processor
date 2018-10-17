/*
 * Setting up Mock for all tests
 */

// During the test the env variable is set to test
process.env.NODE_ENV = 'test'

require('../src/bootstrap')
const config = require('config')
const nock = require('nock')
const URL = require('url')
const testData = require('./testData')

// Mock Posting to Bus API and ES interactions
const authUrl = URL.parse(config.AUTH0_URL)
const subApiUrl = URL.parse(`${config.SUBMISSION_API_URL}/a34e1158-2c27-4d38-b079-5e5cca1bdcf7`)
const challengeApiUrl = URL.parse(`${config.CHALLENGE_API_URL}?filter=id=30051825`)
const memberApiUrl = URL.parse(`${config.MEMBER_API_URL}?filter=id=305384`)

nock(/.com/)
  .persist()
  .post(authUrl.path)
  .reply(200, { access_token: 'test' })
  .get(subApiUrl.path)
  .reply(200, testData.testSubmissionAPIResponse)
  .get(challengeApiUrl.path)
  .reply(200, testData.testChallengeAPIResponse)
  .get(memberApiUrl.path)
  .reply(200, testData.testMemberAPIResponse)
