const {Game} = require('../models')
const {to, ReE, ReS} = require('../services/util')

/**
 * Create Game
 *
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
const create = async function (req, res) {
  let err, game
  let game_info = req.body;

  [err, game] = await to(Game.create(game_info))
  if (err) return ReE(res, err, 422)

  return ReS(res, {game: game.toWeb()}, 201)
}
module.exports.create = create

/**
 * Get all games.
 *
 * @param req
 * @param res
 * @returns {Promise<any|Promise<any>>}
 */
const getAll = async function (req, res) {
  let err, games;
  [err, games] = await to(Game.find())

  if (err) {
    return ReE(res, err)
  }

  let games_json = []
  for (let i in games) {
    let game = games[i]
    games_json.push(game.toWeb())
  }
  return ReS(res, {games: games_json})
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
  return ReS(res, {game: req.game.toWeb()})
}
module.exports.get = get

const update = async function (req, res) {
  let err, game, data
  game = req.game
  data = req.body
  game.set(data);

  [err, game] = await to(game.save())
  if (err) {
    return ReE(res, err)
  }
  return ReS(res, {games: game.toWeb()})
}
module.exports.update = update

const remove = async function (req, res) {
  let game, err

  [err, game] = await to(req.game.remove())
  if (err) return ReE(res, err)

  return ReS(res, {message: 'Deleted Game ' + game.name}, 204)
}
module.exports.remove = remove