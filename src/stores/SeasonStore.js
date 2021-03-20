import {makeAutoObservable} from "mobx";

class SeasonStore {

  selectedSeason = {}

  constructor() {
    makeAutoObservable(this)
  }

  changeSeason(season) {
    this.selectedSeason = season
  }

}

export default new SeasonStore()