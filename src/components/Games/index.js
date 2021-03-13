import React, { Component } from 'react'
import GameList from './GameList'
import { Container } from 'reactstrap'
import { observer } from 'mobx-react';
import './games.scss'
import BackendService from "../../services/BackendService";

class Games extends Component {

  constructor (props) {
    super(props)

    this.state = {
      loading: false,
      games: [],
      error: false
    }
    this.gameService = new BackendService('game')
  }

  componentDidMount () {
    this.setState({loading: true})
    this.gameService.get()
      .then((games) => {
        this.setState({
          games,
          loading: false,
          error: false
        })
      })
      .catch((error) => {
        console.log(error)
        this.setState({
          error: error,
          loading: false,
        })
      })

  }

  render () {
    const {loading, error, games} = this.state
    return (
      <div>
        <Container>
          {loading && <div>Loading ...</div>}
          {error && <div>Error requesting data</div>}
          {games.length > 0 && <GameList games={games}/>}
        </Container>
      </div>
    )
  }
}

export default observer(Games)
