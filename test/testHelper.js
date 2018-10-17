/**
 * Contains generic test helper methods
 */

require('../src/bootstrap')

const { Leaderboard } = require('../src/models')

/*
 * Fetch the record from Database using reviewSummationID
 * @param {String} id Review summation ID used for searching
 * @returns {Promise}
 */
const getById = async (id) => {
  return Leaderboard.findOne({ reviewSummationId: id }, '-_id -__v')
}

module.exports = {
  getById
}
