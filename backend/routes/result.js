const express = require('express'),
  router = express.Router(),
  runQuery = require('../neo4j').runQuery,
  neo4j = require('neo4j-driver'),
  acl = require('./auth').acl

function getResult(res, filter, parameters, limit) {
  const query = 'MATCH (result:Result)--(tag:Tag), (result)-[:GAME]->(game:Game), (player:Player)--(team:Team)-[score:SCORED]-(result) ' +
    'WITH result, game, collect(ID(tag)) AS tagIds, collect(player.nick) AS names, collect(ID(player)) AS playerIds, collect(team.hash) AS team, collect(score.score) AS score, collect(score.funkies) AS funkies ' +
    (filter.length > 0 ? 'WHERE ' + filter.join(' AND ') + ' ' : '') +
    'RETURN result, game.name AS game, ID(game) AS gameID, names, playerIds, team, score, funkies ORDER BY result.date DESC' + limit;
  return runQuery(res, query, parameters).then((results) => {
    return results.map((result) => {
      const scores = {}
      result.team.forEach((team, index) => {
        if (!scores[team]) {
          scores[team] = {players: []}
        }
        scores[team].score = result.score[index]
        scores[team].funkies = result.funkies[index]
        scores[team].players.push({nick: result.names[index], id: result.playerIds[index]})
      })
      return {
        ...result.result,
        game: {
          id: result.gameID,
          name: result.game
        },
        scores: Object.values(scores)
      }
    })
  })
}

router.get('/', (req, res) => {
  const parameters = {}, filter = [];
  let limit = req.query.limit ? parseInt(req.query.limit) : 100;
  if (limit === -1) {
    limit = '';
  } else {
    limit = ' LIMIT ' + limit;
  }
  if (req.query.game) {
    filter.push('ID(game) = $gameID')
    parameters.gameID = parseInt(req.query.game);
  }
  if (req.query.player) {
    filter.push('size([fPlayerId IN $playerID WHERE fPlayerId IN playerIds | 1]) > 0')
    parameters.playerID = req.query.player.split(',').map(id => parseInt(id));
  }
  if (req.query.tag && req.query.tag != 0) {
    filter.push('$tagID IN tagIds')
    parameters.tagID = parseInt(req.query.tag);
  }
  getResult(res, filter, parameters, limit)
    .then((result) => res.send(result))
})

router.get('/:id', (req, res) => {
  const limit = ' LIMIT 1',
    filter = ['ID(result) = $resId'],
    parameters = {resId: neo4j.types.Integer.fromString(req.params.id)}
  getResult(res, filter, parameters, limit)
    .then((result) => {
      if (result.length === 1) {
        res.send(result.pop())
      } else {
        res.status(404);
        res.send({error: 'Not found'})
      }
    })
})

module.exports = router