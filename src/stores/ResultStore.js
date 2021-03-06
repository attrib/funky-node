import { makeAutoObservable } from 'mobx';
import BackendService from "../services/BackendService";

class ResultStore {

  data = [];
  status = "initial";
  order = "asc"

  constructor() {
    this.resultService = new BackendService('result');
    makeAutoObservable(this)
  }

  getRecentResults = async (filter) => {
    try {
      let params = {
        page: 0,
        order: this.order,
        limit: 10,
        ...filter
      };
      const urlParams = new URLSearchParams(Object.entries(params));
      const response = await this.resultService.get(urlParams)
      this.data = response.map((result) => {
        result.date = new Date(result.date)
        return result;
      })
    }
    catch (error) {
      this.status = "error"
    }
  }

}

export default new ResultStore()