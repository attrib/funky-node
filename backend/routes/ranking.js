const express = require('express'),
  router = express.Router(),
  runQuery = require('../neo4j').runQuery,
  neo4j = require('neo4j-driver'),
  acl = require('./auth').acl

router.get('/', (req, res) => {
  const parameters = {}, filter = [];
  const order = req.query.sort ? req.query.sort : 'funkyDiff'
  if (req.query.game) {
    filter.push('ID(game) = $gameID')
    parameters.gameID = parseInt(req.query.game);
  }
  if (req.query.player) {
    filter.push('ID(player) = $playerID')
    parameters.playerID = parseInt(req.query.player);
  }
  if (req.query.tag && req.query.tag != 0) {
    filter.push('ID(tag) = $tagID')
    parameters.tagID = parseInt(req.query.tag);
  }
  const rankBy = req.query.by === 'game' ? 'ID(game) AS id, game.name AS name' : 'ID(player) AS id, player.nick AS nick';
  const query = 'MATCH (player:Player)--(:Team)-[score:SCORED]-(result:Result)--(game:Game), (result)--(tag:Tag) ' +
    (filter.length > 0 ? 'WHERE ' + filter.join(' AND ') + ' ' : '') +
    'RETURN ' + rankBy + ', AVG(score.funkies) AS funkies, SUM(score.funkies)-COUNT(score) AS funkyDiff, SUM(score.won) AS won, COUNT(score) AS played, (SUM(score.won)/COUNT(score)*100) AS wonPercentage ' +
    'ORDER BY ' + order + ' DESC';
  runQuery(res, query, parameters)
    .then((result) => {
      res.send(result)
    })
})

module.exports = router