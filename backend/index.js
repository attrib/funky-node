const
  express = require('express'),
  cors = require('cors'),
  dotenv = require("dotenv"),
  bodyParser = require('body-parser')

dotenv.config()

const app = express()
const port = process.env.PORT

const
  authenticationMiddleware = require('./routes/auth').authenticationMiddleware,
  game = require('./routes/game'),
  player = require('./routes/player'),
  result = require('./routes/result'),
  ranking = require('./routes/ranking'),
  tag = require('./routes/tag'),
  user = require('./routes/user'),
  auth = require('./routes/auth'),
  news = require('./routes/news')

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(authenticationMiddleware)
app.use(cors())

app.get('/', (req, res) => {
  res.redirect(301, 'https://funky.wtf/');
})

app.use('/game', game)
app.use('/player', player)
app.use('/result', result)
app.use('/ranking', ranking)
app.use('/tag', tag)
app.use('/user', user)
app.use('/auth', auth)
app.use('/news', news)

app.listen(port,() => {
  console.log(`Funky backend listening at port ${port}`)
})