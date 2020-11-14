/**
 * The configuration file.
 */

module.exports = {
  LOG_LEVEL: process.env.LOG_LEVEL || 'debug',
  PORT: process.env.PORT || 3000,

  KAFKA_URL: process.env.KAFKA_URL || 'localhost:9092',
  // below two params are used for secure Kafka connection, they are optional
  // for the local Kafka, they are not needed
  KAFKA_CLIENT_CERT: process.env.KAFKA_CLIENT_CERT,
  KAFKA_CLIENT_CERT_KEY: process.env.KAFKA_CLIENT_CERT_KEY,

  KAFKA_GROUP_ID: process.env.KAFKA_GROUP_ID || 'tc-leaderboard-processor',

  // Kafka topics related to Creation, Update and Delete
  CREATE_DATA_TOPIC: process.env.CREATE_DATA_TOPIC || 'submission.notification.create',
  UPDATE_DATA_TOPIC: process.env.UPDATE_DATA_TOPIC || 'submission.notification.update',
  DELETE_DATA_TOPIC: process.env.DELETE_DATA_TOPIC || 'submission.notification.delete',
  AGGREGATE_DATA_TOPIC: process.env.AGGREGATE_DATA_TOPIC || 'submission.notification.aggregate',

  LEADERBOARD_API_URL: process.env.LEADERBOARD_API_URL || 'https://api.topcoder-dev.com/v5/leaderboards',
  SUBMISSION_API_URL: process.env.SUBMISSION_API_URL || 'https://api.topcoder-dev.com/v5/submissions',
  REVIEW_TYPE_URL: process.env.REVIEW_TYPE_URL || 'https://api.topcoder-dev.com/v5/reviewTypes',
  AV_SCAN_NAME: process.env.AV_SCAN_NAME || 'AV Scan',

  AUTH0_URL: process.env.AUTH0_URL,
  AUTH0_AUDIENCE: process.env.AUTH0_AUDIENCE,
  TOKEN_CACHE_TIME: process.env.TOKEN_CACHE_TIME,
  AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
  AUTH0_CLIENT_SECRET: process.env.AUTH0_CLIENT_SECRET,
  AUTH0_PROXY_SERVER_URL: process.env.AUTH0_PROXY_SERVER_URL
}
