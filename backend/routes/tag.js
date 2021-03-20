const express = require('express'),
  router = express.Router(),
  runQuery = require('../neo4j').runQuery,
  neo4j = require('neo4j-driver'),
  acl = require('./auth').acl

router.get('/', (req, res) => {
  const parameters = {}
  const query = "MATCH (tag:Tag) RETURN tag ORDER BY tag.name"
  runQuery(res, query, parameters)
    .then((result) => {
      res.send(result.map(record => record.tag))
    })
})

module.exports = router