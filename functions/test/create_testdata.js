process.env.GOOGLE_APPLICATION_CREDENTIALS = __dirname + '/../account.json'
const admin = require('firebase-admin')
admin.initializeApp()
const firestore = admin.firestore()

firestore.settings({ host: "localhost:8080", ssl: false });

// Create default account for testing
firestore.doc('users/0SM2ksh1V2MZ8ZYDZ704ZnVrrah1')
  .set({
      email: 'funky@attrib.org',
      roles: {
        ADMIN: 'ADMIN',
        APPROVED: 'APPROVED',
      },
      username: 'Karl Fritsche'
    }
  )
  .then(() => {
    return firestore.doc('season/nfgiPoF2rtTvBSD1IGVS').set({
      name: '2020',
      startDate: new Date('2020-01-01'),
      endDate: new Date('2021-01-01'),
    })
  })
  .then((document) => {
    return firestore.doc('players/testuser01').set({
      nick: 'testuser01',
      userID: '',
    })
  })
  .then(() => {
    return firestore.doc('players/testuser02').set({
      nick: 'testuser02',
      userID: '',
    })
  })
  .then(() => {
    return firestore.doc('players/testuser03').set({
      nick: 'testuser03',
      userID: '',
    })
  })
  .then(() => {
    return firestore.doc('players/testuser04').set({
      nick: 'testuser04',
      userID: '',
    })
  })
  .then(() => {
    return firestore.doc('games/testgameScoreTeam').set({
      authorID: '0SM2ksh1V2MZ8ZYDZ704ZnVrrah1',
      description: 'test description',
      image: null,
      liveGameWidget: 'SimpleTable',
      name: "testgameScoreTeam",
      scoreWidget: "ScoreTeamForm",
    })
  })
  .then(() => {
    return firestore.doc('results/result01').set({
      authorID: '0SM2ksh1V2MZ8ZYDZ704ZnVrrah1',
      date: new Date(),
      game: 'testgameScoreTeam',
      gameID: 'testgameScoreTeam',
      image: null,
      location: null,
      notes: 'test',
      scores: [
        {
          players: [firestore.doc('players/testuser01')],
          score: 1000,
        },
        {
          players: [firestore.doc('players/testuser02')],
          score: 100,
        }
      ]
    })
  })
  .catch((error) => {
    console.log(error)
  })

