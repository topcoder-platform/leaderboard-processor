/*
 * Test Data
 */

const createMessage = {
  topic: 'submission.notification.create',
  originator: 'submission-api',
  timestamp: '2018-02-03T00:00:00',
  'mime-type': 'application/json',
  payload: {
    resource: 'reviewSummation',
    id: 'd24d4180-65aa-42ec-a945-5fd21dec0508',
    submissionId: 'a34e1158-2c27-4d38-b079-5e5cca1bdcf7',
    aggregateScore: 88,
    scoreCardId: 'b25a4180-65aa-42ec-a945-5fd21dec0503',
    isPassing: true,
    created: '2018-01-01T00:00:00',
    updated: '2018-01-02T00:00:00',
    createdBy: 'admin',
    updatedBy: 'user'
  }
}

const updateMessage = {
  topic: 'submission.notification.update',
  originator: 'submission-api',
  timestamp: '2018-02-03T00:00:00',
  'mime-type': 'application/json',
  payload: {
    resource: 'reviewSummation',
    id: 'd24d4180-65aa-42ec-a945-5fd21dec0509',
    aggregateScore: 93.5,
    isPassing: true
  }
}

const deleteMessage = {
  topic: 'submission.notification.update',
  originator: 'submission-api',
  timestamp: '2018-02-03T00:00:00',
  'mime-type': 'application/json',
  payload: {
    resource: 'reviewSummation',
    id: 'd24d4180-65aa-42ec-a945-5fd21dec0510'
  }
}

const testSubmissionAPIResponse = {
  'updatedBy': 'lazybaer',
  'created': '2018-08-22T02:41:07.576Z',
  'isFileSubmission': true,
  'type': 'challengesubmission',
  'url': 'https://topcoder-dev-submissions-dmz.s3.amazonaws.com/a34e1158-2c27-4d38-b079-5e5cca1bdcf7',
  'challengeId': 30051825,
  'filename': 'CORE-TopcoderEventBus-190618-1413.pdf.zip',
  'createdBy': 'lazybaer',
  'id': 'a34e1158-2c27-4d38-b079-5e5cca1bdcf7',
  'submissionPhaseId': 747596,
  'updated': '2018-08-22T02:41:07.576Z',
  'fileType': 'zip',
  'memberId': 305384
}

const testChallengeAPIResponse = {
  'id': '-3254eca5:16658dbed10:2c2a',
  'result': {
    'success': true,
    'status': 200,
    'metadata': {
      'fields': null,
      'totalCount': 1
    },
    'content': [
      {
        'groupIds': [
          20000000
        ]
      }
    ]
  }
}

const testMemberAPIResponse = {
  'id': '311d312:166718c336c:1936',
  'result': {
    'success': true,
    'status': 200,
    'metadata': null,
    'content': [
      {
        'id': '8547899',
        'modifiedBy': null,
        'modifiedAt': '2018-10-14T02:53:38.000Z',
        'createdBy': null,
        'createdAt': '2004-03-21T21:05:32.000Z',
        'handle': 'TonyJ',
        'email': 'tjefts+dev@topcoder.com',
        'firstName': 'Tony',
        'lastName': 'L_NAME',
        'credential': {
          'activationCode': 'UASI7X0JS',
          'resetToken': null,
          'hasPassword': true
        },
        'status': 'A',
        'country': null,
        'regSource': null,
        'utmSource': null,
        'utmMedium': null,
        'utmCampaign': null,
        'roles': null,
        'ssoLogin': false,
        'active': true,
        'profile': null,
        'emailActive': true
      }
    ]
  },
  'version': 'v3'
}

const testMongoRecord = {
  reviewSummationId: 'd24d4180-65aa-42ec-a945-5fd21dec0508',
  submissionId: 'a34e1158-2c27-4d38-b079-5e5cca1bdcf7',
  memberId: 305384,
  challengeId: 30051825,
  handle: 'TonyJ',
  aggregateScore: 98.5
}

module.exports = {
  createMessage,
  updateMessage,
  deleteMessage,
  testSubmissionAPIResponse,
  testChallengeAPIResponse,
  testMemberAPIResponse,
  testMongoRecord
}
