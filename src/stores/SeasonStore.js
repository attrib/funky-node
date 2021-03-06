import {makeAutoObservable} from "mobx";

class SeasonStore {

  selectedSeason = {id: 673, name: "2021"} // 2021

  constructor() {
    makeAutoObservable(this)
  }

  changeSeason(season) {
    this.selectedSeason = season
  }

}

export default new SeasonStore()