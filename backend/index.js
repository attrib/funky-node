const
  express = require('express'),
  cors = require('cors'),
  dotenv = require("dotenv"),
  bodyParser = require('body-parser'),
  crypto = require('crypto'),
  fs = require('fs')

dotenv.config()

const app = express()
const port = process.env.PORT
const corsOptions = {}

const
  authenticationMiddleware = require('./routes/auth').authenticationMiddleware,
  verifyToken = require('./routes/auth').verifyToken,
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
const liveGames = {},
  liveGamesFile = './data/liveGames.json'
try {
  if (fs.existsSync(liveGamesFile)) {
    const data = fs.readFileSync(liveGamesFile)
    const games = JSON.parse(data)
    Object.keys(games).forEach((key) => {
      liveGames[key] = games[key]
    })
  }
} catch(err) {
  console.error(err)
}

io.on('connection', socket => {
  socket.emit('livegames', liveGames);

  socket.on('save', (livegame, callback) => {
    const token = livegame.token
    delete livegame.token
    livegame.lastUpdatedDate = new Date()
    if (!livegame.id) {
      verifyToken(token, {ignoreExpiration: true}, (err, user) => {
        if (err) {
          callback({error: 'Auth required'})
          return
        }
        const hash = crypto.createHash('md5')
        hash.update(livegame.date)
        hash.update(livegame.game.name)
        hash.update(livegame.lastUpdatedDate.getTime().toString())
        livegame.id = hash.digest('hex')
        liveGames[livegame.id] = livegame
        io.emit('new', livegame)
      })
    }
    else {
      liveGames[livegame.id] = livegame
      io.emit('update', livegame)
    }
    callback(livegame)
  })

  socket.on('load', (id, callback) => {
    if (liveGames[id]) {
      callback(liveGames[id])
    }
    else {
      callback({error: 'not found'})
    }
  })

  socket.on('delete', (id) => {
    if (liveGames[id]) {
      delete liveGames[id]
      io.emit('delete', id)
    }
  })
});

function saveLiveGames() {
  console.log('save live games')
  fs.writeFileSync(liveGamesFile, JSON.stringify(liveGames))
  setTimeout(saveLiveGames, 3600000)
}

saveLiveGames()

let shutdownRunning = false;
function stop() {
  if (shutdownRunning) {
    return
  }
  shutdownRunning = true
  console.log('exit')
  io.close()
  server.close()
  fs.writeFileSync(liveGamesFile, JSON.stringify(liveGames))
}

process.on('SIGINT', stop);
// process.on('SIGUSR2', stop);