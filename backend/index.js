const
    express = require('express'),
    neo4j = require('neo4j-driver'),
    cors = require('cors'),
    runQuery = require('./neo4j').runQuery

const app = express()
const port = 3000

app.use(cors())

app.get('/', (req, res) => {
    res.redirect('https://funky-clan.de/', 301);
})

app.get('/game', (req, res) => {
    let order = req.query.order === 'desc' ? 'desc' : 'asc';
    runQuery(res, 'MATCH (g:Game) RETURN g ORDER BY g.name ' + order).then((result) => {
        res.send(result.map((result) => result.g))
    })
})

app.get('/game/:id', (req, res) => {
    const id = neo4j.types.Integer.fromString(req.params.id);
    runQuery(res, 'MATCH (g:Game) WHERE ID(g) = $id RETURN g', {id}).then((result) => {
        if (result.length === 1) {
            res.send(result.pop().g)
        }
        else {
            res.statusCode = 404;
            res.send({error: 'Not found'})
        }
    })
})

app.get('/player', (req, res) => {
    runQuery(res, 'MATCH (player:Player) RETURN player').then((result) => {
        res.send(result.map(result => result.player))
    })
})

app.get('/player/:id', (req, res) => {
    const id = neo4j.types.Integer.fromString(req.params.id);
    runQuery(res, 'MATCH (player:Player) WHERE ID(player) = $id  RETURN player', {id}).then((result) => {
        if (result.length === 1) {
            res.send(result.pop().player)
        }
        else {
            res.statusCode = 404;
            res.send({error: 'Not found'})
        }
    })
})

function getResult(res, filter, parameters, limit) {
    const query = 'MATCH (result:Result)--(tag:Tag), (result)-[:GAME]->(game:Game), (player:Player)--(team:Team)-[score:SCORED]-(result) ' +
      'WITH result, game, collect(ID(tag)) AS tagIds, collect(player.nick) AS names, collect(ID(player)) AS playerIds, collect(team.hash) AS team, collect(score.score) AS score, collect(score.funkies) AS funkies ' +
      (filter.length > 0 ? 'WHERE ' + filter.join(' AND ') + ' ' : '') +
      'RETURN result, game.name AS game, ID(game) AS gameID, names, playerIds, team, score, funkies ORDER BY result.date DESC' + limit;
    return runQuery(res, query, parameters).then((results) => {
        return results.map((result) => {
            const scores = {}
            result.team.forEach((team, index) => {
                if (!scores[team]) {
                    scores[team] = {players: []}
                }
                scores[team].score = result.score[index]
                scores[team].funkies = result.funkies[index]
                scores[team].players.push({nick: result.names[index], id: result.playerIds[index]})
            })
            return {
                ...result.result,
                game: {
                    id: result.gameID,
                    name: result.game
                },
                scores: Object.values(scores)
            }
        })
    })
}

app.get('/result', (req, res) => {
    const parameters = {}, filter = [];
    let limit = req.query.limit ? parseInt(req.query.limit) : 100;
    if (limit === -1) {
        limit = '';
    }
    else {
        limit = ' LIMIT ' + limit;
    }
    if (req.query.game) {
        filter.push('ID(game) = $gameID')
        parameters.gameID = parseInt(req.query.game);
    }
    if (req.query.player) {
        filter.push('$playerID IN playerIds')
        parameters.playerID = parseInt(req.query.player);
    }
    if (req.query.tag && req.query.tag != 0) {
        filter.push('$tagID IN tagIds')
        parameters.tagID = parseInt(req.query.tag);
    }
    getResult(res, filter, parameters, limit)
      .then((result) => res.send(result))
})

app.get('/result/:id', (req, res) => {
    const limit = ' LIMIT 1',
        filter = ['ID(result) = $resId'],
        parameters = {resId: neo4j.types.Integer.fromString(req.params.id)}
    getResult(res, filter, parameters, limit)
      .then((result) => {
          if (result.length === 1) {
              res.send(result.pop())
          }
          else {
              res.statusCode = 404;
              res.send({error: 'Not found'})
          }
      })
})

app.get('/ranking', (req, res) => {
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

app.get('/tag', (req, res) => {
    const parameters = {}
    const query = "MATCH (tag:Tag) RETURN tag ORDER BY tag.name"
    runQuery(res, query, parameters)
      .then((result) => {
          res.send(result.map(record => record.tag))
      })
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})