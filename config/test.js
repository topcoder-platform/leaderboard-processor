/**
 * Configuration file to be used while running tests
 */

module.exports = {
  AUTH0_URL: 'http://test.com',
  MONGODB_URL: process.env.TEST_MONGODB_URL || 'mongodb://localhost:27017/leaderboardTestDB'
}
