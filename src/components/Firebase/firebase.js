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
  onAuthUserListener = (next, fallback) =>
    this.auth.onAuthStateChanged(authUser => {
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
            authUser = {
              uid: authUser.uid,
              email: authUser.email,
              ...dbUser,
            }
            next(authUser)
          })
          .catch(error => {
            console.log('Error getting user document: ', error)
            fallback()
          })
      } else {
        fallback()
      }
    })

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
   * Players API
   */

  player = uid => this.db.collection('players').where('userID', '==', uid).get()
}

export default Firebase