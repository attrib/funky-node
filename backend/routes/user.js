const express = require('express'),
  router = express.Router(),
  runQuery = require('../neo4j').runQuery,
  neo4j = require('neo4j-driver'),
  acl = require('./auth').acl,
  bcrypt = require('bcrypt')

function prepareUser(record) {
  const user = record.user
  delete user.password
  user.players = record.players || {}
  user.roles = record.roles || []
  return user
}

router.get('/', acl('admin'), (req, res) => {
  const parameters = {}
  const query = "MATCH (user:User) OPTIONAL MATCH (user)--(r:Role) OPTIONAL MATCH (user)--(p:Player) RETURN user,COLLECT(p) as players, COLLECT(r.name) as roles"
  runQuery(res, query, parameters)
    .then((result) => {
      res.send(result.map(record => {
        return prepareUser(record)
      }))
    })
})

router.get('/:id', acl('self'), (req, res) => {
  const parameters = {id: neo4j.types.Integer.fromString(req.params.id)}
  const query = "MATCH (user:User) WHERE ID(user) = $id OPTIONAL MATCH (user)--(r:Role) OPTIONAL MATCH (user)--(p:Player) RETURN user,COLLECT(p) as players, COLLECT(r.name) as roles"
  runQuery(res, query, parameters)
    .then((result) => {
      if (result.length === 1) {
        const record = result.pop()
        return prepareUser(record)
      } else {
        res.status(404);
        res.send({error: 'Not found'})
      }
    })
})

router.post('/', (req, res) => {
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
              const record = result.pop()
              return prepareUser(record)
            } else {
              res.status(500)
              res.send({error: "Error while creating user"})
            }
          })
      }
    })
})

router.patch('/:id', acl('self'), (req, res) => {
  const parameters = {id: neo4j.types.Integer.fromString(req.params.id)}, set = []

  if (req.body.username) {
    set.push('SET user.username = $username');
    parameters.username = req.body.username
  }
  if (req.body.password) {
    set.push('SET user.password = $password');
    parameters.password = bcrypt.hashSync(req.body.password, 10)
  }
  if (req.body.deleteLinkedPlayer) {
    set.push(`MATCH (user)-[delRel:IS]->(delPlayer:Player {nick: $delNick}) DELETE delRel`)
    parameters[`delNick`] = req.body.deleteLinkedPlayer
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
  if (req.body.rolesDelete) {
    let rDId = 0
    req.body.rolesDelete.forEach((role) => {
      set.push(`MATCH (user)-[delRelRole${rDId}:MEMBER]->(roleDel${rDId}:Role {name: $roleDel${rDId}}) DELETE delRelRole${rDId}`)
      parameters[`roleDel${rDId}`] = role
      rDId++
    })
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
        return prepareUser(record)
      } else {
        res.status(404);
        res.send({error: 'Not found'})
      }
    })
})

module.exports = router
