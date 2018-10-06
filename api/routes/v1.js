const express = require('express')
const router = express.Router()

const UserController = require('../controllers/user')
const GameController = require('../controllers/game')
const ResultController = require('../controllers/result')

const custom = require('./../middleware/custom')

const passport = require('passport')

require('./../middleware/passport')(passport)

/* GET home page. */
router.get('/', function (req, res, next) {
  res.json({status: 'success', message: 'funky API', data: {'version_number': 'v1.0.0'}})
})

router.post('/user', UserController.create)
router.post('/user/login', UserController.login)

router.get('/user', UserController.getAll)
router.put('/user', passport.authenticate('jwt', {session: false}), UserController.update)
router.delete('/user', passport.authenticate('jwt', {session: false}), UserController.remove)

router.get('/user/:user_id', custom.user, UserController.get)
router.put('/user/:user_id', passport.authenticate('jwt', {session: false}), custom.isAdmin, custom.user, UserController.update)
router.delete('/user/:user_id', passport.authenticate('jwt', {session: false}), custom.isAdmin, custom.user, UserController.remove)


router.post('/game', passport.authenticate('jwt', {session: false}), GameController.create)
router.get('/game', GameController.getAll)

router.get('/game/:game_id', custom.game, GameController.get)
router.put('/game/:game_id', passport.authenticate('jwt', {session: false}), custom.game, GameController.update)
router.delete('/game/:game_id', passport.authenticate('jwt', {session: false}), custom.isAdmin, custom.game, GameController.remove)

router.post('/result', passport.authenticate('jwt', {session: false}), ResultController.create)
router.get('/result', ResultController.getAll)

router.get('/result/:result_id', ResultController.get)
router.put('/result/:result_id', passport.authenticate('jwt', {session: false}), ResultController.update)
router.delete('/result/:result_id', passport.authenticate('jwt', {session: false}), custom.isAdmin, ResultController.remove)


module.exports = router
