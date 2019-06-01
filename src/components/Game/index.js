import React, { Component } from 'react'
import GameList from './GameList'
import { Col, Container, Row } from 'reactstrap'
import { withFirebase } from '../Firebase'

class Game extends Component {

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
          <Row>
            <Col>
              {loading && <div>Loading ...</div>}
              <GameList games={games}/>
            </Col>
          </Row>
        </Container>
      </div>
    )
  }
}

export default withFirebase(Game)
