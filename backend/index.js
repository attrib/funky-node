const
  express = require('express'),
  cors = require('cors'),
  dotenv = require("dotenv"),
  bodyParser = require('body-parser'),
  crypto = require('crypto')

dotenv.config()

const app = express()
const port = process.env.PORT
const corsOptions = {}

const
  authenticationMiddleware = require('./routes/auth').authenticationMiddleware,
  game = require('./routes/game'),
  player = require('./routes/player'),
  team = require('./routes/team'),
  result = require('./routes/result'),
  ranking = require('./routes/ranking'),
  tag = require('./routes/tag'),
  user = require('./routes/user'),
  auth = require('./routes/auth'),
  news = require('./routes/news')

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(authenticationMiddleware)
app.use(cors(corsOptions))

app.get('/', (req, res) => {
  res.redirect(301, 'https://funky.wtf/');
})

app.use('/game', game)
app.use('/player', player)
app.use('/team', team)
app.use('/result', result)
app.use('/ranking', ranking)
app.use('/tag', tag)
app.use('/user', user)
app.use('/auth', auth)
app.use('/news', news)

const server = app.listen(port,() => {
  console.log(`Funky backend listening at port ${port}`)
})

const io = require('socket.io')(server, {cors: corsOptions});
const liveGames = []

io.on('connection', socket => {
  socket.emit('livegames', Object.values(liveGames));

  socket.on('save', (livegame) => {
    console.log('received', livegame)
    livegame.lastUpdatedDate = new Date()
    if (!livegame.id) {
      const hash = crypto.createHash('md5')
      hash.update(livegame.date)
      hash.update(livegame.game.name)
      hash.update(livegame.lastUpdatedDate.getTime().toString())
      livegame.id = hash.digest('hex')
      liveGames[livegame.id] = livegame
      socket.emit('created', livegame)
      io.emit('new', livegame)
    }
    else {
      liveGames[livegame.id] = livegame
      io.emit('update', livegame)
    }
  })

  socket.on('load', (id) => {
    if (liveGames[id]) {
      socket.emit('load', liveGames[id])
    }
    else {
      socket.emit('load', {error: 'not found'})
    }
  })

  socket.on('delete', (id) => {
    if (liveGames[id]) {
      delete liveGames[id]
      io.emit('delete', id)
    }
  })
});
