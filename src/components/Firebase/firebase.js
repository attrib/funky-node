import app from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'

const config = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_DATABASE_URL,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_ID
}

class Firebase {
  constructor () {
    app.initializeApp(config)
    app.firestore().enablePersistence()
    this.emailAuthProvider = app.auth.EmailAuthProvider
    this.auth = app.auth()
    this.db = app.firestore()
    this.Timestamp = app.firestore.Timestamp

    this.googleProvider = new app.auth.GoogleAuthProvider()
  }

  getCurrentDate = () => this.Timestamp.now()

  // *** Auth API ***

  doCreateUserWithEmailAndPassword = (email, password) =>
    this.auth.createUserWithEmailAndPassword(email, password)

  doSignInWithEmailAndPassword = (email, password) =>
    this.auth.signInWithEmailAndPassword(email, password)

  doSignOut = () => this.auth.signOut()

  doPasswordReset = email => this.auth.sendPasswordResetEmail(email)

  doPasswordUpdate = password =>
    this.auth.currentUser.updatePassword(password)

  doSignInWithGoogle = () =>
    this.auth.signInWithPopup(this.googleProvider)

  // *** Merge Auth and DB User API *** //
  onAuthUserListener = (next, fallback) => {
    let userObject = {}
    return this.auth.onAuthStateChanged(authUser => {
      if (authUser) {
        this.user(authUser.uid).get()
          .then(doc => {
            if (!doc.exists) {
              fallback()
            }
            const dbUser = doc.data()
            // default empty roles
            if (!dbUser.roles) {
              dbUser.roles = {}
            }
            // merge auth and db user
            userObject = {
              uid: authUser.uid,
              email: authUser.email,
              ...dbUser,
            }
            return this.playerByUID(authUser.uid)
          })
          .then((snapshots) => {
            let players = {}
            snapshots.forEach((snapshot) => {
              players[snapshot.id] = {
                ...snapshot.data(),
                id: snapshot.id
              }
            })
            userObject.players = players
            next(userObject)
          })
          .catch(error => {
            console.log('Error getting user document: ', error)
            fallback()
          })
      } else {
        fallback()
      }
    })
  }

  // *** User API ***
  user = uid => this.db.collection('users').doc(uid)

  users = () => this.db.collection('users').get()

  /**
   * News API
   */
  news = () => this.db.collection('News').orderBy('Date', 'desc').get()

  newsItem = (id) => this.db.collection('News').doc(id)

  newsAdd = (item) => this.db.collection('News').add(item)

  /**
   * Games API
   */
  games = () => this.db.collection('games').get()

  game = (id) => this.db.collection('games').doc(id)

  gameAdd = (item) => this.db.collection('games').add(item)

  /**
   * Result API
   */

  resultsCollection = () => this.db.collection('results').orderBy('date', 'desc')

  results = () => this.resultsCollection().get()

  resultsByGameId = (gameID) => this.resultsCollection().where('gameID', '==', gameID).get()

  resultsByPlayerId = (playerID) => this.resultsCollection().where('playerIDs', 'array-contains', playerID).get()

  resultsResolvePlayers = (results) => {
    let players = {}
    results.forEach((result) => {
      result.scores.forEach((score) => {
        score.players.forEach((player) => {
          if (!(player.id in players)) {
            players[player.id] = player.get()
          }
        })
      })
    })
    return Promise.all(Object.values(players))
      .then((snapshots) => {
        let players = {}
        snapshots.forEach((snapshot) => players[snapshot.id] = snapshot.data())
        return results.map((result) => {
          result.scores.map((score) => {
            score.players = score.players.map((player) => {
              return players[player.id]
            })
            return score
          })
          return result
        })
      })
  }

  /**
   * Players API
   */

  playerByUID = uid => this.db.collection('players').where('userID', '==', uid).get()

  player = id => this.db.collection('players').doc(id)

  playerSearch = value => this.db.collection('players')
    .where('userID', '==', '')
    .orderBy('nick').limit(5)
    .startAt(value).endAt(value + '\uf8ff').get()

  playerByName = name => this.db.collection('players').where('nick', '==', name).get()
    .then((snapshots) => {
      if (snapshots.size === 0) {
        return this.db.collection('players').add({
          nick: name,
          userID: ''
        }).then((snapshot) => {
          return {
            id: snapshot.id,
            nick: name,
            userID: ''
          }
        })
      }
      else {
        let player = []
        snapshots.forEach((snapshot) => {
          player.push({
            ...snapshot.data(),
            id: snapshot.id
          })
        })
        return player.shift()
      }
    })
}

export default Firebase