const express = require('express'),
  router = express.Router(),
  runQuery = require('../neo4j').runQuery,
  neo4j = require('neo4j-driver'),
  acl = require('./auth').acl,
  MarkdownIt = require('markdown-it')

const md = new MarkdownIt()

function prepareNews(news) {
  news.content = md.render(news.markdown ?? '')
  return news
}

router.get('/', (req, res) => {
  const parameters = {}
  const query = "MATCH (news:News) RETURN news ORDER BY news.date DESC"
  runQuery(res, query, parameters)
    .then((result) => {
      res.send(result.map(record => prepareNews(record.news)))
    })
})

router.post('/', acl('admin'), (req, res) => {
  const parameters = {
    news: {
      title: req.body.title,
      markdown: req.body.markdown,
      date: req.body.date,
    },
    username: req.user.username
  }
  const query = 'MATCH (user:User {username:$username}) CREATE (news:News $news), (news)<-[:AUTHOR]-(user) RETURN news'
  runQuery(res, query, parameters)
    .then((result) => {
      res.send(prepareNews(result.pop().news))
    })
})

router.patch('/:id', acl('admin'), (req, res) => {
  const id = neo4j.types.Integer.fromString(req.params.id),
    set = [],
    parameters = {id}
  Object.keys(req.body).forEach((key) => {
    if (['title', 'markdown', 'date'].includes(key)) {
      set.push(`SET news.${key} = $${key}`)
      parameters[key] = req.body[key]
    }
  })
  if (set.length === 0) {
    res.status(400)
    res.send({error: 'Nothing to update?'})
    return
  }
  const query = 'MATCH (news:News) WHERE ID(news) = $id ' + set.join(' ') + ' RETURN news'
  runQuery(res, query, parameters).then((result) => {
    if (result.length === 1) {
      res.send(prepareNews(result.pop().news))
    } else {
      res.status(404);
      res.send({error: 'Not found'})
    }
  })
})

router.delete('/:id', acl('admin'), (req, res) => {
  const parameter = {id: neo4j.types.Integer.fromString(req.params.id)}
  let query = 'MATCH (news:News) WHERE ID(news)=$id DETACH DELETE news'
  runQuery(res, query, parameter)
    .then(() => {
      res.send({success: true})
    })
    .catch((error) => {
      console.log(error)
      res.status(400)
      res.send({error})
    })
})

module.exports = router