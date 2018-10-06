const {Roles, User, Game, Result} = require('../models')
const {to, ReE, ReS} = require('../services/util')

/**
 * Check if current user has admin role.
 *
 * @param req
 * @param res
 * @param next
 * @returns {Promise<any|Promise<any>>}
 */
let isAdmin = async function (req, res, next) {
  if (!req.user.hasRole(Roles.ADMIN)) {
    return ReE(res, 'Only admins can do that.')
  }
  next()
}
module.exports.isAdmin = isAdmin

/**
 * Add game to request.
 *
 * @param req
 * @param res
 * @param next
 * @returns {Promise<any|Promise<any>>}
 */
let game = async function (req, res, next) {
  let err, game
  [err, game] = await to(Game.findOne({_id: req.params.game_id}));
  if (err) {
    return ReE(res, err)
  }
  if (!game) {
    return ReE(res, "Not found", 404)
  }
  req.game = game
  next()
}
module.exports.game = game

/**
 * Add viewUser to request.
 *
 * @param req
 * @param res
 * @param next
 * @returns {Promise<any|Promise<any>>}
 */
let user = async function (req, res, next) {
  // Skip if login
  if (req.params.user_id === "login") {
    return next();
  }
  let err, user
  [err, user] = await to(User.findOne({_id: req.params.user_id}));
  if (err) {
    return ReE(res, err)
  }

  if (!user) {
    return ReE(res, "Not found", 404)
  }
  req.viewUser = user
  next()
}
module.exports.user = user

/**
 * Add result to request
 *
 * @param req
 * @param res
 * @param next
 * @returns {Promise<*>}
 */
let result = async function (req, res, next) {
  let err, result
  [err, result] = await to(Result.findOne({_id: req.params.result_id}));
  if (err) {
    return ReE(res, err)
  }

  if (!result) {
    return ReE(res, "Not found", 404)
  }
  req.result = result
  next()
}
module.exports.result = result