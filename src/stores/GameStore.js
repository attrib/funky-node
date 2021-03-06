import { makeAutoObservable } from 'mobx';
import BackendService from "../services/BackendService";

class GameStore {

    constructor(){
        this.gameService = new BackendService('game');
        makeAutoObservable(this)
    }
    data = [];
    status = "initial";
    order = "asc"

    getGames = async () => {
        try {
            let params = {
                page: 0,
                order: this.order
            };
            const urlParams = new URLSearchParams(Object.entries(params));
            this.data = await this.gameService.get(urlParams)
        } catch (error) {
            this.data = [];
            this.status = "error";
        }
    };

    getGame = async (id) => {
        return await this.gameService.getId(id)
    }

}


export default new GameStore();