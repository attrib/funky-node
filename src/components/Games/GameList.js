import React, { Component } from 'react'
import { Button, Card, CardBody, CardFooter, CardImg, CardText, CardTitle, Col, Row } from 'reactstrap'
import * as ROUTES from '../../constants/routes'
import { withRouter } from 'react-router-dom'
import SessionStore from "../../stores/SessionStore";

class GameList extends Component {

  openGameDetails = (id) => {
    this.props.history.push(`${ROUTES.GAMES}/${id}`)
  }

  render () {
    return (
      <>
        {(SessionStore.isAdmin) && <Button color="link" onClick={() => this.openGameDetails('new')}>Create Game</Button>}
        <Row className="games">
          {
            this.props.games.map(game => (
              <Col md={3} sm={6} key={game.id}>
                <Card onClick={() => this.openGameDetails(game.id)}>
                  {game.image && <CardImg src={game.image} alt={game.name} />}
                  <CardBody>
                    <CardTitle>{game.name}</CardTitle>
                    <CardText dangerouslySetInnerHTML={{__html: game.description}}/>
                  </CardBody>
                  <CardFooter>
                    <Button className="col-12">Details</Button>
                  </CardFooter>
                </Card>
              </Col>
            ))
          }
        </Row>
      </>
    )
  }

}

export default withRouter(GameList)
