process.env.GOOGLE_APPLICATION_CREDENTIALS = 'account.json'
const admin = require('firebase-admin')
admin.initializeApp()
const firestore = admin.firestore()
const updateStatsFromResults = require('./updateResults').updateStatsFromResults

const fs = require('fs')
const CSV = require('csv-string');
const md = require('markdown-it')();
const authorID = '0SM2ksh1V2MZ8ZYDZ704ZnVrrah1'
const RankingGames = ['Poker']

const tables = {}

fs.readFile('funkyOld.sql', (err, data) => {
  const regexp = RegExp('INSERT INTO `(.*)` VALUES (.*);','gi');
  const matches = data.toString('utf8').matchAll(regexp);

  for (const match of matches) {
    const tableName = match[1];
    tables[tableName] = {};
    const entries = match[2].substr(1, match[2].length-2).split('),(')
    for (const entry of entries) {
      const columns = CSV.parse(entry, ',', '\'')[0]
      tables[tableName][columns[0]] = {rawData: columns}
    }
  }

  console.log(Object.keys(tables))

  fetchGames()
    .then(() => {
      return fetchPlayers()
    })
    .then(() => {
      Object.values(tables.score).forEach((item) => {
        if (!('scores' in tables.result[item.rawData[2]])) {
          tables.result[item.rawData[2]].scores = {}
        }
        if (!item.rawData[4] || item.rawData[4] === 'NULL') {
          item.rawData[4] = item.rawData[1]
        }
        const score = parseFloat(item.rawData[3]);
        if (!(item.rawData[4] in tables.result[item.rawData[2]].scores)) {
          tables.result[item.rawData[2]].scores[item.rawData[4]] = {
            players: [],
            score: score,
          }
        }
        if (score !== tables.result[item.rawData[2]].scores[item.rawData[4]].score) {
          console.log('same team, differnt scores', item.rawData[4], item, tables.result[item.rawData[2]].scores)
        }
        tables.result[item.rawData[2]].scores[item.rawData[4]].players.push(tables.player[item.rawData[1]].ref);
      })
    })
    .then(() => {
      let promises = []
      let i = 1;
      Object.values(tables.result).forEach((item) => {
        const result = {
          authorID: authorID,
          date: admin.firestore.Timestamp.fromDate(new Date(item.rawData[2])),
          game: tables.game[item.rawData[1]].name,
          gameID: tables.game[item.rawData[1]].id,
          image: null,
          location: null,
          notes: item.rawData[3] && item.rawData[3] !== 'NULL' ? item.rawData[3] : '',
          scores: Object.values(item.scores)
        }
        if (result.notes.toLowerCase().includes('original')) {
          console.log(result.notes, item)
        }
        if (tables.game[item.rawData[1]].doc && tables.game[item.rawData[1]].doc.scoreWidget === 'ScoreRankingForm') {
          const newScores = []
          let points = 0, lastScore = -1, rank = result.scores.length+1, skip = 1
          result.scores.sort(function (a, b) {
            return a.score - b.score;
          }).forEach((scoreItem) => {
            if (lastScore !== scoreItem.score) {
              points=points+skip
              rank=rank-skip
              skip=1
            }
            else {
              skip++
            }
            newScores.push({
              players: scoreItem.players,
              rank: rank,
              score: points
            })
            lastScore = scoreItem.score
          })
          newScores.reverse()
          newScores[0].score++
          result.scores = newScores
        }

        promises.push(new Promise((resolve, reject) => {
          setTimeout(() => {
            resolve(result)
          }, i * 1500)
        })
          .then((result) => {
            console.log(result)
            return firestore.collection('results').add(result)
          })
        )
        i++
      })
      return Promise.all(promises)
    })
})

function fetchGames () {
  let promises = []
  Object.values(tables.game).forEach((item) => {
    const gameName = item.rawData[1]
    item.name = gameName
    promises.push(firestore.collection('games').where('name', '==', gameName).get()
      .then((snapshots) => {
        if (snapshots.size === 1) {
          //console.info(`Found Game ${item.name}`)
          const snapshot = snapshots.docs.shift();
          item.id = snapshot.id
          item.doc = snapshot.data()
        }
        else if (snapshots.size > 1) {
          console.error(`Multiple games found for ${item.name}`)
        }
        else {
          console.log(`Unknown game ${item.name}`)
          return firestore.collection('games').add({
            name: gameName,
            description_markdown: item.rawData[4],
            description: md.render(item.rawData[4]),
            authorID: authorID,
            image: null,
            liveGameWidget: 'SimpleTable',
            scoreWidget: RankingGames.includes(gameName) ? 'ScoreRankingForm' : 'ScoreTeamForm',
          }).then((game) => {
            return game.get()
          })
          .then((game) => {
            item.id = game.id
            item.doc = game.data()
          })
        }
      }))
  })
  return Promise.all(promises)
}

function fetchPlayers () {
  let promises = []
  Object.values(tables.player).forEach((item) => {
    item.nick = item.rawData[1]
    promises.push(firestore.collection('players').where('nick', '==', item.nick).get()
      .then((snapshots) => {
        if (snapshots.size === 1) {
          //console.log(`Found Player ${item.nick}`)
          const snapshot = snapshots.docs.shift();
          item.id = snapshot.id
          item.ref = snapshot.ref
          item.doc = snapshot.data()
        }
        else if (snapshots.size > 1) {
          console.log(`Multiple players found for ${item.nick}`)
        }
        else {
          console.log(`Unknown player ${item.nick}`)
          return firestore.collection('players').add({
            nick: item.nick,
            userID: '',
          }).then((player) => {
            return player.get()
          })
            .then((player) => {
              item.id = player.id
              item.ref = player.ref
              item.doc = player.data()
            })
        }
      }))
  })
  return Promise.all(promises)
}