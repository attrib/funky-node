const {Result} = require('../models')
const {to, ReE, ReS} = require('../services/util')

/**
 * Create Result
 *
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
const create = async function (req, res) {
  let err, result
  let result_info = req.body;

  [err, result] = await to(Result.create(result_info))
  if (err) return ReE(res, err, 422)

  return ReS(res, {game: result.toWeb()}, 201)
}
module.exports.create = create

/**
 * Get all results.
 *
 * @param req
 * @param res
 * @returns {Promise<any|Promise<any>>}
 */
const getAll = async function (req, res) {
  let err, results;
  [err, results] = await to(Result.find())

  if (err) {
    return ReE(res, err)
  }

  let result_json = []
  for (let i in results) {
    let result = results[i]
    result_json.push(result.toWeb())
  }
  return ReS(res, {games: result_json})
}
module.exports.getAll = getAll

/**
 * Get game
 *
 * @param req
 * @param res
 * @returns {any|Promise<any>}
 */
const get = function (req, res) {
  return ReS(res, {result: req.result.toWeb()})
}
module.exports.get = get

const update = async function (req, res) {
  let err, result, data
  result = req.result
  data = req.body
  result.set(data);

  [err, result] = await to(result.save())
  if (err) {
    return ReE(res, err)
  }
  return ReS(res, {results: result.toWeb()})
}
module.exports.update = update

const remove = async function (req, res) {
  let result, err

  [err, result] = await to(req.result.remove())
  if (err) return ReE(res, err)

  return ReS(res, {message: 'Deleted result ' + result._id}, 204)
}
module.exports.remove = remove