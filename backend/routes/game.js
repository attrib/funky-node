const express = require('express'),
  router = express.Router(),
  runQuery = require('../neo4j').runQuery,
  neo4j = require('neo4j-driver'),
  acl = require('./auth').acl,
  MarkdownIt = require('markdown-it')

const md = new MarkdownIt()

function prepareGame(game) {
  game.description = md.render(game.description_markdown)
  game.playerCount = {}
  game.playerCount.teamMin = game.playerCount_teamMin
  game.playerCount.teamMax = game.playerCount_teamMax
  game.playerCount.perTeamMin = game.playerCount_perTeamMin
  game.playerCount.perTeamMax = game.playerCount_perTeamMax
  delete game.playerCount_teamMin
  delete game.playerCount_teamMax
  delete game.playerCount_perTeamMin
  delete game.playerCount_perTeamMax
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
    score_widget: req.body.score_widget,
    livegame_widget: req.body.livegame_widget,
    playerCount_teamMin: req.body.playerCount.teamMin,
    playerCount_teamMax: req.body.playerCount.teamMax,
    playerCount_perTeamMin: req.body.playerCount.perTeamMin,
    playerCount_perTeamMax: req.body.playerCount.perTeamMax,
  }
  const query = 'MERGE (g:Game {name: $name, description_markdown: $description_markdown, score_widget: $score_widget, livegame_widget: $livegame_widget, playerCount_teamMin: $playerCount_teamMin, playerCount_teamMax: $playerCount_teamMax, playerCount_perTeamMin: $playerCount_perTeamMin, playerCount_perTeamMax: $playerCount_perTeamMax}) RETURN g'
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
    if (['name', 'description_markdown', 'score_widget', 'livegame_widget'].includes(key)) {
      set.push(`SET g.${key} = $${key}`)
      parameters[key] = req.body[key]
    }
    if (key === 'playerCount') {
      for (let playerCountKey of Object.keys(req.body[key])) {
        if (['teamMin', 'teamMax', 'perTeamMin', 'perTeamMax'].includes(playerCountKey)) {
          set.push(`SET g.${key}_${playerCountKey} = $${key}_${playerCountKey}`)
          parameters[`${key}_${playerCountKey}`] = Number(req.body[key][playerCountKey])
        }
      }
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