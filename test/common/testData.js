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
      timestamp: '2018-08-06T15:46:05.575Z',
      'mime-type': 'application/json',
      payload: {
        resource: 'review',
        id: '49871146-eb0a-4d0e-ab9a-adc94018c5da',
        submissionId: 'a34e1158-2c27-4d38-b079-5e5cca1bdcf7',
        score: -1,
        scoreCardId: 30001852,
        metadata: {
          testType: 'provisional',
          assertions: {
            pending: 0,
            failed: 1,
            total: 10
          },
          tests: {
            total: 10
          }
        },
        created: '2019-11-06T15:02:35.539Z',
        updated: '2019-11-06T15:02:35.539Z',
        createdBy: 'I3etJtTqlz1XHgCXduBN1us705ufrykl@clients',
        updatedBy: 'I3etJtTqlz1XHgCXduBN1us705ufrykl@clients',
        status: 'completed',
        reviewerId: '0301619c-3d9e-44c3-85cb-c20311100f7f',
        typeId: '52c91e85-745f-4e62-b592-9879a2dfe9fd'
      }
    }
  },
  update: {
    requiredFields: ['topic', 'originator', 'timestamp', 'mime-type', 'payload.submissionId'],
    stringFields: ['topic', 'originator', 'mime-type', 'payload.submissionId'],
    testMessage: {
      topic: 'submission.notification.update',
      originator: 'submission-api',
      timestamp: '2018-08-06T15:46:05.575Z',
      'mime-type': 'application/json',
      payload: {
        resource: 'review',
        id: '49871146-eb0a-4d0e-ab9a-adc94018c5da',
        submissionId: 'a34e1158-2c27-4d38-b079-5e5cca1bdcf8',
        score: 52,
        scoreCardId: 30001852,
        metadata: {
          testType: 'provisional',
          assertions: {
            pending: 0,
            failed: 2,
            total: 10
          },
          tests: {
            total: 10
          }
        },
        created: '2019-11-06T15:02:35.539Z',
        updated: '2019-11-06T15:02:35.539Z',
        createdBy: 'I3etJtTqlz1XHgCXduBN1us705ufrykl@clients',
        updatedBy: 'I3etJtTqlz1XHgCXduBN1us705ufrykl@clients',
        status: 'completed',
        reviewerId: '0301619c-3d9e-44c3-85cb-c20311100f7f',
        typeId: '52c91e85-745f-4e62-b592-9879a2dfe9fd'
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
        resource: 'review',
        id: '49871146-eb0a-4d0e-ab9a-adc94018c5da'
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
    'url': 'https://topcoder-dev-submissions-dmz.s3.amazonaws.com/a34e1158-2c27-4d38-b079-5e5cca1bdcf8',
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
