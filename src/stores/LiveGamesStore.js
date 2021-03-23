import {makeAutoObservable} from "mobx";
import {io} from "socket.io-client";

class LiveGamesStore {
  liveGames = {}

  constructor() {
    makeAutoObservable(this)

    const url = new URL(process.env.REACT_APP_BACKEND_URL)
    this.socket = io(`ws://${url.host}`);

    this.socket.on('livegames', (liveGames) => {
      this.setLiveGames(liveGames)
    });

    this.socket.on('new', (liveGame) => {
      this.setLiveGame(liveGame)
    });

    this.socket.on('update', (liveGame) => {
      this.setLiveGame(liveGame)
    });

    this.socket.on('delete', (id) => {
      this.deleteLiveGame(id)
    })
  }

  get liveGamesArray() {
    return Object.values(this.liveGames)
  }

  getLiveGame = async (id) => {
    if (this.liveGames[id]) {
      console.log('load cached')
      return this.liveGames[id]
    }
    return new Promise((resolve, reject) => {
      this.socket.emit('load', id)
      this.socket.once('load', (liveGame) => {
        if (liveGame.error) {
          reject('Not found')
        }
        else {
          this.setLiveGame(liveGame)
          resolve(this.getLiveGame(id))
        }
      })
    })
  }

  setLiveGames = (liveGames) => {
    this.liveGames = liveGames
  }

  setLiveGame = (liveGame) => {
    this.liveGames[liveGame.id] = liveGame
  }

  deleteLiveGame = (id) => {
    delete this.liveGames[id]
  }

  save = (liveGame) => {
    this.socket.emit('save', liveGame)
    if (liveGame.id) {
      return liveGame.id
    }
    return new Promise((resolve, reject) => {
      this.socket.once('created', (liveGame) => {
        resolve(liveGame)
      })
    })
  }

  delete = (id) => {
    this.socket.emit('delete', id)
  }

}

export default new LiveGamesStore()