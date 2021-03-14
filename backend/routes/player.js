const express = require('express'),
  router = express.Router(),
  runQuery = require('../neo4j').runQuery,
  neo4j = require('neo4j-driver'),
  acl = require('./auth').acl

router.get('/', (req, res) => {
  const parameters = {}, filter = []
  if (req.query.search) {
    filter.push('toLower(player.nick) STARTS WITH $search')
    parameters.search = req.query.search;
  }
  runQuery(res, 'MATCH (player:Player) ' +
    (filter.length > 0 ? 'WHERE ' + filter.join(' AND ') + ' ' : '') +
    'RETURN player', parameters).then((result) => {
    res.send(result.map(result => result.player))
  })
})

router.get('/:id', (req, res) => {
  const id = neo4j.types.Integer.fromString(req.params.id);
  runQuery(res, 'MATCH (player:Player) WHERE ID(player) = $id  RETURN player', {id}).then((result) => {
    if (result.length === 1) {
      res.send(result.pop().player)
    } else {
      res.status(404);
      res.send({error: 'Not found'})
    }
  })
})

module.exports = router