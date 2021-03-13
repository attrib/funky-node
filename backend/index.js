const
  express = require('express'),
  neo4j = require('neo4j-driver'),
  cors = require('cors'),
  runQuery = require('./neo4j').runQuery,
  getResult = require('./neo4j').getResult,
  jwt = require('jsonwebtoken'),
  dotenv = require("dotenv"),
  bcrypt = require('bcrypt'),
  bodyParser = require('body-parser')

dotenv.config()

const app = express()
const port = process.env.PORT,
  access_token_secret = process.env.ACCESS_TOKEN_SECRET

function acl(permission) {
  return function authenticationRequired(req, res, next) {
    // Gather the jwt access token from the request header
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null) return res.sendStatus(401) // if there isn't any token
    jwt.verify(token, access_token_secret, (err, user) => {
      if (err) {
        console.log(err)
        return res.sendStatus(403)
      }
      req.user = user
      switch (permission) {
        default:
          return res.sendStatus(403)

        case 'auth':
          break;

        case 'admin':
          if (!(user.roles.includes('ADMIN'))) {
            return res.sendStatus(403)
          }
          break;

        case 'self':
          if (!(user.roles.includes('ADMIN')) && user.id != req.params.id) {
            return res.sendStatus(403)
          }
          break;

      }
      next() // pass the execution off to whatever request the client intended
    })
  }
}

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cors())

app.get('/', (req, res) => {
  res.redirect('https://funky-clan.de/', 301);
})

app.get('/game', (req, res) => {
  let order = req.query.order === 'desc' ? 'desc' : 'asc';
  runQuery(res, 'MATCH (g:Game) RETURN g ORDER BY toLower(g.name) ' + order).then((result) => {
    res.send(result.map((result) => result.g))
  })
})

app.get('/game/:id', (req, res) => {
  const id = neo4j.types.Integer.fromString(req.params.id);
  runQuery(res, 'MATCH (g:Game) WHERE ID(g) = $id RETURN g', {id}).then((result) => {
    if (result.length === 1) {
      res.send(result.pop().g)
    } else {
      res.status(404);
      res.send({error: 'Not found'})
    }
  })
})

app.get('/player', (req, res) => {
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

app.get('/player/:id', (req, res) => {
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

app.get('/result', (req, res) => {
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

app.get('/result/:id', (req, res) => {
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

app.get('/user', acl('admin'), (req, res) => {
  const parameters = {}
  const query = "MATCH (user:User) OPTIONAL MATCH (user)--(r:Role) OPTIONAL MATCH (user)--(p:Player) RETURN user,COLLECT(p) as players, COLLECT(r.name) as roles"
  runQuery(res, query, parameters)
    .then((result) => {
      res.send(result.map(record => {
        const user = record.user
        delete user.password
        user.players = record.players
        user.roles = record.roles
        return user
      }))
    })
})

app.get('/user/:id', acl('self'), (req, res) => {
  const parameters = {id: neo4j.types.Integer.fromString(req.params.id)}
  const query = "MATCH (user:User) WHERE ID(user) = $id OPTIONAL MATCH (user)--(r:Role) OPTIONAL MATCH (user)--(p:Player) RETURN user,COLLECT(p) as players, COLLECT(r.name) as roles"
  runQuery(res, query, parameters)
    .then((result) => {
      if (result.length === 1) {
        const record = result.pop()
        const user = record.user
        delete user.password
        user.players = record.players
        user.roles = record.roles
        res.send(user)
      } else {
        res.status(404);
        res.send({error: 'Not found'})
      }
    })
})

app.post('/user', (req, res) => {
  const parameters = {username: req.body.username}
  const query = "MATCH (user:User {username: $username}) RETURN user"
  runQuery(res, query, parameters)
    .then((result) => {
      if (result.length > 0) {
        res.status(400)
        res.send({
          error: 'User already exists'
        })
      } else {
        const parameters = {
          user:
            {
              username: req.body.username,
              password: bcrypt.hashSync(req.body.password, 10),
            }
        }
        const query = "CREATE (user:User $user) RETURN user"
        runQuery(res, query, parameters)
          .then((result) => {
            if (result.length > 0) {
              const user = result.pop().user
              delete user.password
              res.send(user)
            } else {
              res.status(500)
              res.send({error: "Error while creating user"})
            }
          })
      }
    })
})

app.patch('/user/:id', acl('self'), (req, res) => {
  const parameters = {id: neo4j.types.Integer.fromString(req.params.id)}, set = []

  if (req.body.username) {
    set.push('SET user.username = $username');
    parameters.username = req.body.username
  }
  if (req.body.password) {
    set.push('SET user.password = $password');
    parameters.password = bcrypt.hashSync(req.body.password, 10)
  }
  if (req.body.players && req.body.players.length > 0) {
    let pId = 0
    req.body.players.forEach((player) => {
      set.push(`MERGE (player${pId}:Player {nick: $nick${pId}})`)
      parameters[`nick${pId}`] = player.nick
      set.push(`MERGE (user)-[:IS]->(player${pId})`)
      pId++
    })
  }
  if (req.body.deleteLinkedPlayer) {
    set.push(`MATCH (user)-[delRel:IS]->(delPlayer:Player {nick: $delNick}) DELETE delRel`)
    parameters[`delNick`] = req.body.deleteLinkedPlayer
  }
  if (req.user.roles.includes('ADMIN') && req.body.roles && req.body.roles.length > 0) {
    let rId = 0
    req.body.roles.forEach((role) => {
      set.push(`MERGE (role${rId}:Role {name: $role${rId}})`)
      parameters[`role${rId}`] = role
      set.push(`MERGE (user)-[:MEMBER]->(role${rId})`)
      rId++
    })
  }

  if (set.length === 0) {
    res.status(400)
    res.send({error: 'Nothing sent to set'})
    return;
  }

  const query = 'MATCH (user:User) WHERE ID(user) = $id ' +
    set.join(' ') +
    ' WITH user OPTIONAL MATCH (user)--(r:Role) OPTIONAL MATCH (user)--(p:Player) RETURN user,COLLECT(p) as players, COLLECT(r.name) as roles'
  runQuery(res, query, parameters)
    .then((result) => {
      if (result.length === 1) {
        const record = result.pop()
        const user = record.user
        delete user.password
        user.players = record.players
        user.roles = record.roles
        res.send(user)
      } else {
        res.status(404);
        res.send({error: 'Not found'})
      }
    })
})

app.post('/auth', (req, res) => {
  const parameters = {username: req.body.username}
  const query = "MATCH (user:User {username: $username}) OPTIONAL MATCH (user)--(r:Role) OPTIONAL MATCH (user)--(p:Player) RETURN user,COLLECT(p) as players, COLLECT(r.name) as roles"
  runQuery(res, query, parameters)
    .then((result) => {
      if (result.length === 1) {
        const record = result.pop();
        const user = record.user
        if (bcrypt.compareSync(req.body.password, user.password)) {
          const exp = Math.floor(Date.now() / 1000) + (60 * 60)
          delete user.password
          user.players = record.players
          user.roles = record.roles
          res.send({
            exp: exp,
            token: jwt.sign({...user, exp: exp}, access_token_secret),
            user: user
          });
        } else {
          res.sendStatus(403)
        }
      } else {
        res.sendStatus(403)
      }
    })
})

app.get('/auth', acl('auth'), (req, res) => {
  const exp = Math.floor(Date.now() / 1000) + (60 * 60)
  res.send({
    exp: exp,
    token: jwt.sign({...res.user, exp: exp}, access_token_secret),
  });
})

app.get('/news', (req, res) => {
  const parameters = {}
  const query = "MATCH (news:News) RETURN news ORDER BY news.date"
  runQuery(res, query, parameters)
    .then((result) => {
      res.send(result.map(record => record.news))
    })
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})