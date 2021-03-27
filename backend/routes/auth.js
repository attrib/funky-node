const express = require('express'),
  router = express.Router(),
  runQuery = require('../neo4j').runQuery,
  neo4j = require('neo4j-driver'),
  bcrypt = require('bcrypt'),
  jwt = require('jsonwebtoken')

const access_token_secret = process.env.ACCESS_TOKEN_SECRET
const signingOptions = {subject: 'user', audience: 'funky-clan.de', issuer: process.env.ISSUER}

function prepareUser(record) {
  const user = record.user
  delete user.password
  user.players = record.players || {}
  user.roles = record.roles || []
  return user
}

function authMiddleware(req, res, next) {
  // Gather the jwt access token from the request header
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  req.user = null
  if (token == null) {
    next()
    return
  }
  verifyToken(token, {ignoreExpiration: false}, (err, user) => {
    if (err) {
      return next()
    }
    else {
      req.user = user
      next()
    }
  })
}

function verifyToken(token, options, callback) {
  jwt.verify(token, access_token_secret, {...options, ...signingOptions}, callback)
}

/**
 *
 * @param permission
 * @returns {function(e.Request, e.Response, e.NextFunction): undefined}
 */
function acl(permission) {
  /**
   * @param {express.Request} req
   * @param {express.Response} res
   * @param {express.NextFunction} next
   */
  function authenticationRequired(req, res, next) {
    if (!req.user) {
      return res.redirect(401, '/auth')
    }
    let access = false
    switch (permission) {
      default:
        return

      case 'auth':
        access = true
        break;

      case 'admin':
        if (req.user.roles.includes('ADMIN')) {
          access = true
        }
        break;

      case 'self':
        if (req.user.roles.includes('ADMIN') || req.user.id == req.params.id) {
          access = true
        }
        break;

    }
    if (access) {
      next()
    }
    else {
      res.status(403)
      return res.send({error: `Permission ${permission} is required`})
    }
  }

  return authenticationRequired
}

function expireTime() {
  return Math.floor(Date.now() / 1000) + 7200
}

router.post('/', (req, res) => {
  const parameters = {username: req.body.username}
  const query = "MATCH (user:User {username: $username}) OPTIONAL MATCH (user)--(r:Role) OPTIONAL MATCH (user)--(p:Player) RETURN user,COLLECT(p) as players, COLLECT(r.name) as roles"
  runQuery(res, query, parameters)
    .then((result) => {
      if (result.length === 1) {
        const record = result.pop();
        const user = prepareUser(JSON.parse(JSON.stringify(record)))
        if (bcrypt.compareSync(req.body.password, record.user.password)) {
          const exp = expireTime()
          res.send({
            exp: exp,
            token: jwt.sign({...user, exp: exp}, access_token_secret, signingOptions),
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

router.get('/', (req, res) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (token == null) {
    return res.redirect(401, '/auth')
  }
  verifyToken(token, {ignoreExpiration: true}, (err, payload) => {
    if (err) {
      res.status(403)
      return res.send({error: err})
    }
    const exp = expireTime()
    delete payload.aud
    delete payload.iss
    delete payload.sub
    res.send({
      exp: exp,
      token: jwt.sign({...payload, exp: exp}, access_token_secret, signingOptions),
    });
  })
})


module.exports = router
module.exports.authenticationMiddleware = authMiddleware
module.exports.acl = acl
module.exports.verifyToken = verifyToken