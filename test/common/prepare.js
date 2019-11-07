/*
 * Setting up Mock for all tests
 */

const nock = require('nock')
const prepare = require('mocha-prepare')
const { submissionAPIResponse, reviewTypesResponse } = require('./testData')

prepare(function (done) {
  nock(/\.com/)
    .persist()
    .post('/oauth/token')
    .reply(200, { access_token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJyb2xlcyI6WyJUb3Bjb2RlciBVc2VyIiwiQ29ubmVjdCBTdXBwb3J0IiwiYWRtaW5pc3RyYXRvciIsInRlc3RSb2xlIiwiYWFhIiwidG9ueV90ZXN0XzEiLCJDb25uZWN0IE1hbmFnZXIiLCJDb25uZWN0IEFkbWluIiwiY29waWxvdCIsIkNvbm5lY3QgQ29waWxvdCBNYW5hZ2VyIl0sImlzcyI6Imh0dHBzOi8vYXBpLnRvcGNvZGVyLWRldi5jb20iLCJoYW5kbGUiOiJUb255SiIsImV4cCI6MTU2NTY4MTkyMCwidXNlcklkIjoiODU0Nzg5OSIsImlhdCI6MTU1NTY4MTMyMCwiZW1haWwiOiJhamVmdHNAdG9wY29kZXIuY29tIiwianRpIjoiMTlhMDkzNzAtMjk4OC00N2I4LTkxODktMGRhODVjNjM0ZWQyIn0.V8nsQpbzQ_4iEd0dAbuYsfeydnhSAEQ95AKKwl8RONw' })
    .get('/v5/submissions/a34e1158-2c27-4d38-b079-5e5cca1bdcf7')
    .reply(200, submissionAPIResponse[0])
    .get('/v5/submissions/a34e1158-2c27-4d38-b079-5e5cca1bdcf8')
    .reply(200, submissionAPIResponse[1])
    .get('/v5/submissions/a34e1158-2c27-4d38-b079-5e5cca1bdcf9')
    .reply(404)
    .get('/v5/leaderboard?challengeId=30051825&memberId=8547899')
    .reply(200, [])
    .get('/v5/leaderboard?challengeId=30051825&memberId=22688726')
    .reply(200, [{}])
    .post('/v5/leaderboard/challenge/30051825/member/8547899')
    .reply(200)
    .patch('/v5/leaderboard/challenge/30051825/member/22688726')
    .reply(200)
    .delete('/v5/leaderboard/review/49871146-eb0a-4d0e-ab9a-adc94018c5da')
    .reply(204)
    .get('/v5/reviewTypes?name=AV%20Scan')
    .reply(200, reviewTypesResponse)

  done()
}, function (done) {
// called after all test completes (regardless of errors)
  nock.cleanAll()
  done()
})
