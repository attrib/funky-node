import {makeAutoObservable} from "mobx";
import BackendService from "../services/BackendService";

class RankingStore {

  data = []
  status = "initial"
  order = "asc"

  constructor() {
    this.rankingService = new BackendService('ranking');
    makeAutoObservable(this)
  }

  getRanking = async (filter) => {
    try {
      let params = {
        ...filter
      }
      const urlParams = new URLSearchParams(Object.entries(params));
      this.data = await this.rankingService.get(urlParams)
      console.log(this.data)
    }
    catch (error) {
      this.status = "error"
    }
  }

}

export default new RankingStore()