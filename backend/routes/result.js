const express = require('express'),
  router = express.Router(),
  runQuery = require('../neo4j').runQuery,
  neo4j = require('neo4j-driver'),
  acl = require('./auth').acl,
  crypto = require('crypto')

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

const MIN_FUNKIES = 0.1

function calcScore(result) {
  const countPlayers = result.scores.reduce((acc, value) => acc + value.players.length, 0);
  let minScore = result.scores.reduce((acc, value) => (acc.score > value.score) ? value : acc);
  let origData = []
  result.scores.forEach((score) => {
    origData.push({...score})
  })
  let normalizedScore = [...result.scores];

  // Increase score, so nobody has a negative value
  if (minScore.score < 0) {
    normalizedScore = result.scores.map((score) => {
      score.score += 2 * Math.abs(minScore.score)
      return score
    })
  }

  // Increase score if min score is below < 0.1
  minScore = normalizedScore.reduce((acc, value) => (acc.score > value.score) ? value : acc);
  const sumScore = normalizedScore.reduce((acc, value) => acc + value.score, 0);
  let minFunkies = countPlayers * minScore.score / minScore.players.length / sumScore;
  if (minFunkies <= MIN_FUNKIES) {
    let normalizeScore = ( (MIN_FUNKIES * minScore.players.length) * ( sumScore + result.scores.length * Math.abs(minScore.score)) ) / ( countPlayers - MIN_FUNKIES * minScore.players.length * result.scores.length)
    normalizeScore -= minScore.score
    normalizedScore = normalizedScore.map((score) => {
      score.score += normalizeScore
      return score
    })
  }

  const sumScoreNormalized = normalizedScore.reduce((acc, value) => acc + value.score, 0);
  const max = normalizedScore.reduce((max, value) => (value.score > max.score) ? value : max)
  const scores = normalizedScore.map((score, index) => {
    score.funkies = countPlayers * score.score / score.players.length / sumScoreNormalized;
    score.score = origData[index].score
    score.won = (max.score === score.score) ? 1 : 0;
    return score
  })

  return scores
}


router.get('/', (req, res) => {
  const parameters = {}, filter = [];
  let limit = req.query.limit ? parseInt(req.query.limit) : 100;
  if (limit === -1) {
    limit = '';
  } else {
    limit = ' LIMIT ' + limit;
  }
  if (req.query.game) {
    filter.push('ID(game) = $gameID')
    parameters.gameID = parseInt(req.query.game);
  }
  if (req.query.player) {
    filter.push('size([fPlayerId IN $playerID WHERE fPlayerId IN playerIds | 1]) > 0')
    parameters.playerID = req.query.player.split(',').map(id => parseInt(id));
  }
  if (req.query.tag && req.query.tag != 0) {
    filter.push('$tagID IN tagIds')
    parameters.tagID = parseInt(req.query.tag);
  }
  getResult(res, filter, parameters, limit)
    .then((result) => res.send(result))
})

router.get('/:id', (req, res) => {
  const limit = ' LIMIT 1',
    filter = ['ID(result) = $resId'],
    parameters = {resId: neo4j.types.Integer.fromString(req.params.id)}
  getResult(res, filter, parameters, limit)
    .then((result) => {
      if (result.length === 1) {
        res.send(result.pop())
      } else {
        res.status(404);
        res.send({error: 'Not found'})
      }
    })
})

router.post('/', acl('auth'), (req, res) => {
  const result = req.body

  let parameter = {game: result.game.name, date: result.date, notes: result.notes};

  let creates = ['(game)<-[rg:GAME]-(result:Result {date: datetime($date), notes: $notes})'],
    merge = ['(game:Game {name: $game})'];

  let tagIndex = 0;
  result.tags.forEach((tag) => {
    merge.push(`(tag${tagIndex}:Tag {name: $tag${tagIndex}})`);
    creates.push(`(tag${tagIndex})<-[rt${tagIndex}:TAG]-(result)`);
    parameter['tag' + tagIndex] = tag.name;
    tagIndex++;
  });

  let scoreIndex = 0, playerIndex = 0;
  calcScore(result).forEach((score) => {
    parameter['score' + scoreIndex] = score.score;
    parameter['funkies' + scoreIndex] = score.funkies;
    parameter['won' + scoreIndex] = score.won;

    let team = score.players.map((player) => player.nick),
      hash = crypto.createHash('md5');
    team.sort()
    team.forEach(player => hash.update(player))
    hash = hash.digest('hex');
    merge.push(`(team${scoreIndex}:Team {hash: $teamHash${scoreIndex}})`)
    parameter['teamHash' + scoreIndex] = hash;
    team.forEach((player) => {
      merge.push(`(player${playerIndex}:Player {nick: $player${playerIndex}})`)
      parameter['player' + playerIndex] = player;
      merge.push(`(player${playerIndex})-[:MEMBER]->(team${scoreIndex})`)
      playerIndex++;
    })

    creates.push(`(team${scoreIndex})-[rs${scoreIndex}:SCORED {score: $score${scoreIndex}, funkies: $funkies${scoreIndex}, won: $won${scoreIndex}}]->(result)`);
    scoreIndex++;
  });
  parameter.username = req.user.username
  creates.push(`(result)<-[:AUTHOR]-(user)`)

  let query = 'MATCH (user:User {username:$username}) MERGE ' + merge.join('\n MERGE ') +  '\n CREATE ' + creates.join(',\n') + ' RETURN ID(result) AS id';
  runQuery(res, query, parameter)
    .then((record) => {
      const limit = ' LIMIT 1',
        filter = ['ID(result) = $resId'],
        parameters = {resId: record.pop().id}
      return getResult(res, filter, parameters, limit)
    })
    .then((results) => {
      res.send(results.pop())
    })
    .catch((error) => {
      console.log(error)
      res.status(400)
      res.send({error})
    })
})

router.patch('/:id', acl('admin'), (req, res) => {
  const parameter = {id: neo4j.types.Integer.fromString(req.params.id)}
  const result = req.body
  let query = 'MATCH (:Team)-[rs:SCORED]->(result:Result)-[rg:GAME]->(:Game), (result)-[rt:TAG]->(:Tag) WHERE ID(result)=$id DELETE rs, rg, rt RETURN result'
  runQuery(res, query, parameter)
    .then((records) => {
      if (records.length === 0) {
        throw new Error(`Result ${req.params.id} not found`)
      }

      parameter.game = result.game.name
      parameter.date = result.date
      parameter.notes = result.notes

      let
        set = ['SET result.date = datetime($date)', 'SET result.notes = $notes'],
        creates = ['(game)<-[rg:GAME]-(result)'],
        merge = ['(game:Game {name: $game})'];

      let tagIndex = 0;
      result.tags.forEach((tag) => {
        merge.push(`(tag${tagIndex}:Tag {name: $tag${tagIndex}})`);
        creates.push(`(tag${tagIndex})<-[rt${tagIndex}:TAG]-(result)`);
        parameter['tag' + tagIndex] = tag.name;
        tagIndex++;
      });

      let scoreIndex = 0, playerIndex = 0;
      calcScore(result).forEach((score) => {
        parameter['score' + scoreIndex] = score.score;
        parameter['funkies' + scoreIndex] = score.funkies;
        parameter['won' + scoreIndex] = score.won;

        let team = score.players.map((player) => player.nick),
          hash = crypto.createHash('md5');
        team.sort()
        team.forEach(player => hash.update(player))
        hash = hash.digest('hex');
        merge.push(`(team${scoreIndex}:Team {hash: $teamHash${scoreIndex}})`)
        parameter['teamHash' + scoreIndex] = hash;
        team.forEach((player) => {
          merge.push(`(player${playerIndex}:Player {nick: $player${playerIndex}})`)
          parameter['player' + playerIndex] = player;
          merge.push(`(player${playerIndex})-[:MEMBER]->(team${scoreIndex})`)
          playerIndex++;
        })

        creates.push(`(team${scoreIndex})-[rs${scoreIndex}:SCORED {score: $score${scoreIndex}, funkies: $funkies${scoreIndex}, won: $won${scoreIndex}}]->(result)`);
        scoreIndex++;
      });

      let query = 'MATCH (result:Result) WHERE ID(result)=$id '+ set.join(' ') + ' MERGE ' + merge.join('\n MERGE ') +  '\n CREATE ' + creates.join(',\n') + ' RETURN ID(result) AS id';
      return runQuery(res, query, parameter)
    })
    .then((record) => {
      const limit = ' LIMIT 1',
        filter = ['ID(result) = $resId'],
        parameters = {resId: record.pop().id}
      return getResult(res, filter, parameters, limit)
    })
    .then((results) => {
      res.send(results.pop())
    })
    .catch((error) => {
      console.log(error)
      res.status(400)
      res.send({error})
    })
})

router.delete('/:id', acl('admin'), (req, res) => {
  const parameter = {id: neo4j.types.Integer.fromString(req.params.id)}
  let query = 'MATCH (result:Result) WHERE ID(result)=$id DETACH DELETE result'
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
module.exports.calcScore = calcScore