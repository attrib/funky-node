import React, { Component } from 'react'
import { Button, Col, Row } from 'reactstrap'
import * as ROUTES from '../../constants/routes'
import { withRouter } from 'react-router-dom'
import * as ROLES from '../../constants/roles'
import AuthUserContext from '../Session/context'

class GameList extends Component {

  openGameDetails = (id) => {
    this.props.history.push(`${ROUTES.GAMES}/${id}`)
  }

  render () {
    return (
      <>
        <AuthUserContext.Consumer>
          {authUser => (
            (authUser && authUser.roles[ROLES.ADMIN] === ROLES.ADMIN) && <Button color="link" onClick={() => this.openGameDetails('new')}>Create Game</Button>
          )}
        </AuthUserContext.Consumer>
        <Row className="games">
          {
            this.props.games.map(game => (
              <Col className="game" key={game.id} xs="6" sm="4" onClick={() => this.openGameDetails(game.id)}>
                <h2>{game.name}</h2>
                {game.image && <img src={game.image} alt={game.name} />}
                <p dangerouslySetInnerHTML={{__html: game.description}}/>
              </Col>
            ))
          }
        </Row>
        </>
    )
  }

}

export default withRouter(GameList)
