import {makeAutoObservable} from "mobx";
import {ADMIN, APPROVED} from "../constants/roles";

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
    if (this.user && this.token) {
      return true;
    }
    return false;
  }

  /**
   * @param {import('../services/BackendService').authService} authService
   * @returns {null}
   */
  getToken = async (authService) => {
    if (this.token) {
      if ((new Date().getTime()) / 1000 > this.expired) {
        try {
          const result = await authService.get('')
          if (result) {
            this.token = result.token
            this.expired = result.exp
            localStorage.setItem('session', JSON.stringify({token: this.token, user: this.user, exp: this.expired}))
          }
          else {
            return ''
          }
        }
        catch (err) {
          console.log(err)
          return ''
        }
      }
      return this.token
    }
    return ''
  }

  get playerIds() {
    if (this.user) {
      return this.user.players.map(player => player.id)
    }
    return []
  }

  get isApproved() {
    return this.loggedIn && (this.user.roles.includes(APPROVED) || this.user.roles.includes(ADMIN))
  }

  get isAdmin() {
    return this.loggedIn && this.user.roles.includes(ADMIN)
  }

}

export default new SessionStore()