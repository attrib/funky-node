const express = require('express'),
  router = express.Router(),
  runQuery = require('../neo4j').runQuery,
  neo4j = require('neo4j-driver'),
  acl = require('./auth').acl,
  MarkdownIt = require('markdown-it')

const md = new MarkdownIt()

function prepareNews(news) {
  news.content = md.render(news.markdown)
  return news
}

router.get('/', (req, res) => {
  const parameters = {}
  const query = "MATCH (news:News) RETURN news ORDER BY news.date"
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
    }
  }
  const query = 'CREATE (news:News $news) RETURN news'
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

module.exports = router