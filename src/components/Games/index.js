import React, { Component } from 'react'
import GameList from './GameList'
import { Container } from 'reactstrap'
import { observer } from 'mobx-react';
import './games.scss'
import GameStore from "../../stores/GameStore";

class Games extends Component {

  constructor (props) {
    super(props)

    this.state = {
      loading: false,
    }
  }

  componentDidMount () {
    this.refreshList();
  }

  refreshList() {
    this.setState({loading: true})
    GameStore.getGames().then(() => {
      this.setState({loading: false})
    })
  }

  render () {
    return (
      <div>
        <Container>
          {this.state.loading && <div>Loading ...</div>}
          {GameStore.status === 'error' && <div>Error requesting data</div>}
          {GameStore.status !== 'error' && <GameList games={GameStore.data}/>}
        </Container>
      </div>
    )
  }
}

export default observer(Games)
