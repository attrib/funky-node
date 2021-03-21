const express = require('express'),
  router = express.Router(),
  runQuery = require('../neo4j').runQuery,
  neo4j = require('neo4j-driver'),
  acl = require('./auth').acl

router.get('/', (req, res) => {
  const parameters = {}, filter = [];
  let withQuery = ''
  const order = req.query.sort ? req.query.sort : 'funkyDiff'
  if (req.query.game) {
    filter.push('ID(game) = $gameID')
    parameters.gameID = parseInt(req.query.game);
  }
  if (req.query.player) {
    filter.push('ID(player) = $playerID')
    parameters.playerID = parseInt(req.query.player);
  }
  if (req.query.team) {
    filter.push('ID(team) = $teamID')
    parameters.teamID = parseInt(req.query.team);
  }
  if (req.query.tag) {
    filter.push('ID(tag) = $tagID')
    parameters.tagID = parseInt(req.query.tag);
  }
  let rankBy
  switch (req.query.by) {
    default:
      rankBy = 'ID(player) AS id, player.nick AS nick'
      break;

    case 'team':
      rankBy = 'ID(team) AS id, players'
      withQuery = 'with team, score, COLLECT(player) AS players WHERE size(players) > 1 '
      break;

    case 'game':
      rankBy = 'ID(game) AS id, game.name AS name'
      break;

    case 'team_game':
      rankBy = 'ID(game) AS id, game.name AS name'
      withQuery = 'with game, score, COLLECT(player) AS players WHERE size(players) > 1 '
      break;
  }
  const query = 'MATCH (team:Team)-[score:SCORED]-(result:Result)--(game:Game), (result)--(tag:Tag), (player:Player)--(team:Team) ' +
    (filter.length > 0 ? 'WHERE ' + filter.join(' AND ') + ' ' : '') +
    (withQuery.length > 0 ? withQuery : '') +
    'RETURN ' + rankBy + ', AVG(score.funkies) AS funkies, SUM(score.funkies)-COUNT(score)+1 AS funkyDiff, SUM(score.won) AS won, COUNT(score) AS played, (SUM(score.won)/COUNT(score)*100) AS wonPercentage ' +
    'ORDER BY ' + order + ' DESC';
  runQuery(res, query, parameters)
    .then((result) => {
      res.send(result)
    })
})

module.exports = router