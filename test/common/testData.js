/*
 * Test Data
 */

const testTopics = {
  create: {
    requiredFields: ['topic', 'originator', 'timestamp', 'mime-type', 'payload.submissionId'],
    stringFields: ['topic', 'originator', 'mime-type', 'payload.submissionId'],
    testMessage: {
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
  },
  update: {
    requiredFields: ['topic', 'originator', 'timestamp', 'mime-type', 'payload.submissionId'],
    stringFields: ['topic', 'originator', 'mime-type', 'payload.submissionId'],
    testMessage: {
      topic: 'submission.notification.update',
      originator: 'submission-api',
      timestamp: '2018-02-03T00:00:00',
      'mime-type': 'application/json',
      payload: {
        resource: 'reviewSummation',
        id: 'd24d4180-65aa-42ec-a945-5fd21dec0509',
        submissionId: 'a34e1158-2c27-4d38-b079-5e5cca1bdcf8',
        aggregateScore: 93.5,
        isPassing: true
      }
    }
  },
  delete: {
    requiredFields: ['topic', 'originator', 'timestamp', 'mime-type', 'payload.id'],
    stringFields: ['topic', 'originator', 'mime-type', 'payload.id'],
    testMessage: {
      topic: 'submission.notification.delete',
      originator: 'submission-api',
      timestamp: '2018-02-03T00:00:00',
      'mime-type': 'application/json',
      payload: {
        resource: 'reviewSummation',
        id: 'd24d4180-65aa-42ec-a945-5fd21dec0510'
      }
    }
  }
}

const submissionAPIResponse = [
  {
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
    'memberId': 8547899
  },
  {
    'updatedBy': 'lazybaer',
    'created': '2018-08-22T02:41:07.576Z',
    'isFileSubmission': true,
    'type': 'challengesubmission',
    'url': 'https://topcoder-dev-submissions-dmz.s3.amazonaws.com/a34e1158-2c27-4d38-b079-5e5cca1bdcf7',
    'challengeId': 30051825,
    'filename': 'CORE-TopcoderEventBus-190618-1413.pdf.zip',
    'createdBy': 'lazybaer',
    'id': 'a34e1158-2c27-4d38-b079-5e5cca1bdcf8',
    'submissionPhaseId': 747596,
    'updated': '2018-08-22T02:41:07.576Z',
    'fileType': 'zip',
    'memberId': 22688726
  }
]

module.exports = {
  submissionAPIResponse,
  testTopics
}
