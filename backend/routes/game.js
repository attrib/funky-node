const express = require('express'),
  router = express.Router(),
  runQuery = require('../neo4j').runQuery,
  neo4j = require('neo4j-driver'),
  acl = require('./auth').acl,
  MarkdownIt = require('markdown-it')

const md = new MarkdownIt()

function prepareGame(game) {
  game.description = md.render(game.description_markdown)
  return game
}

router.get('/', (req, res) => {
  let order = req.query.order === 'desc' ? 'desc' : 'asc';
  runQuery(res, 'MATCH (g:Game) RETURN g ORDER BY toLower(g.name) ' + order).then((result) => {
    res.send(result.map((result) => prepareGame(result.g)))
  })
})

router.get('/:id', (req, res) => {
  const id = neo4j.types.Integer.fromString(req.params.id);
  runQuery(res, 'MATCH (g:Game) WHERE ID(g) = $id RETURN g', {id}).then((result) => {
    if (result.length === 1) {
      res.send(prepareGame(result.pop().g))
    } else {
      res.status(404);
      res.send({error: 'Not found'})
    }
  })
})

router.post('/', acl('admin'), (req, res) => {
  const parameters = {
    name: req.body.name,
    description_markdown: req.body.description_markdown,
    scoreWidget: req.body.scoreWidget,
  }
  const query = 'MERGE (g:Game {name: $name, description_markdown: $description_markdown, scoreWidget: $scoreWidget}) RETURN g'
  runQuery(res, query, parameters)
    .then((result) => {
      res.send(prepareGame(result.pop().g))
    })
})

router.patch('/:id', acl('admin'), (req, res) => {
  const id = neo4j.types.Integer.fromString(req.params.id),
    set = [],
    parameters = {id}
  Object.keys(req.body).forEach((key) => {
    if (['name', 'description_markdown', 'scoreWidget'].includes(key)) {
      set.push(`SET g.${key} = $${key}`)
      parameters[key] = req.body[key]
    }
  })
  if (set.length === 0) {
    res.status(400)
    res.send({error: 'Nothing to update?'})
    return
  }
  const query = 'MATCH (g:Game) WHERE ID(g) = $id ' + set.join(' ') + ' RETURN g'
  runQuery(res, query, parameters).then((result) => {
    if (result.length === 1) {
      res.send(prepareGame(result.pop().g))
    } else {
      res.status(404);
      res.send({error: 'Not found'})
    }
  })
})


module.exports = router