const express = require('express'),
  router = express.Router(),
  runQuery = require('../neo4j').runQuery,
  neo4j = require('neo4j-driver'),
  acl = require('./auth').acl

function prepareTeam(record) {
  return {...record.team, players: record.players}
}

router.get('/', (req, res) => {
  const parameters = {}
  runQuery(res, 'MATCH (team:Team)--(player:Player) ' +
    'RETURN team, COLLECT(player) AS players', parameters).then((result) => {
    res.send(result.map(result => prepareTeam(result)))
  })
})

router.get('/:id', (req, res) => {
  const id = neo4j.types.Integer.fromString(req.params.id);
  runQuery(res, 'MATCH (team:Team)--(player:Player) WHERE ID(team) = $id RETURN team, COLLECT(player) AS players', {id}).then((result) => {
    if (result.length === 1) {
      res.send(prepareTeam(result.pop()))
    } else {
      res.status(404);
      res.send({error: 'Not found'})
    }
  })
})

module.exports = router