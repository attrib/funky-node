import {makeAutoObservable} from "mobx";

class SessionStore {

  user = null
  token = null
  expired = null

  constructor() {
    makeAutoObservable(this)
    const result = localStorage.getItem('session')
    if (result) {
      try {
        const session = JSON.parse(result)
        this.login(session)
      }
      catch (e) {
      }
    }
  }

  login = (result) => {
    this.token = result.token
    this.user = result.user
    this.expired = result.exp
    localStorage.setItem('session', JSON.stringify(result))
  }

  signOut = () => {
    console.log(this)
    this.token = null
    this.user = null
    this.expired = null
    localStorage.removeItem('session')
  }

  refreshUser = (user) => {
    this.user = user
    localStorage.setItem('session', JSON.stringify({token: this.token, user, exp: this.expired}))
  }

  get loggedIn() {
    if (this.user && this.token && (new Date().getTime()) / 1000 < this.expired) {
      return true;
    }
    return false;
  }

  get playerIds() {
    if (this.user) {
      return this.user.players.map(player => player.id)
    }
    return []
  }

}

export default new SessionStore()