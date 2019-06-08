import React, { Component } from 'react'
import GameList from './GameList'
import { Container } from 'reactstrap'
import { withFirebase } from '../Firebase'
import { withRouter } from 'react-router-dom'
import { compose } from 'recompose'
import './games.scss'

class Games extends Component {

  constructor (props) {
    super(props)

    this.state = {
      loading: false,
      games: [],
    }
  }

  componentDidMount () {
    this.setState({loading: true})

    this.props.firebase.games()
      .then(snapshot => {
        let games = []
        snapshot.forEach(document => {
          games.push({
            ...document.data(),
            id: document.id,
          })
        })

        this.setState({
          games: games,
          loading: false,
        })
      })
      .catch(error => console.log(error))
  }

  render () {
    const {games, loading} = this.state

    return (
      <div>
        <Container>
          {loading && <div>Loading ...</div>}
          <GameList games={games}/>
        </Container>
      </div>
    )
  }
}

export default compose(
  withFirebase,
  withRouter
)(Games)
