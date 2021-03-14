const express = require('express'),
  router = express.Router(),
  runQuery = require('../neo4j').runQuery,
  neo4j = require('neo4j-driver'),
  acl = require('./auth').acl

router.get('/', (req, res) => {
  const parameters = {}
  const query = "MATCH (news:News) RETURN news ORDER BY news.date"
  runQuery(res, query, parameters)
    .then((result) => {
      res.send(result.map(record => record.news))
    })
})

module.exports = router