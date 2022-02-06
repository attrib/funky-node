import React, { Component } from 'react'
import {Button, Card, CardBody, CardSubtitle, CardFooter, CardImg, CardText, CardTitle, Col, Row} from 'reactstrap'
import * as ROUTES from '../../constants/routes'
import { withRouter } from 'react-router-dom'
import SessionStore from "../../stores/SessionStore";
import GameLink from "./GameLink";

class GameList extends Component {

  openGameDetails = (id) => {
    this.props.history.push(`${ROUTES.GAMES}/${id}`)
  }

  playerCount = (game) => {
    if (!game.playerCount || !game.playerCount.teamMin || !game.playerCount.teamMax) {
      return ""
    }
    let minPlayer = (game.playerCount.teamMin ?? 1) * (game.playerCount.perTeamMin ?? 1)
    let maxPlayer = (game.playerCount.teamMax ?? 1) * (game.playerCount.perTeamMax ?? 1)
    if (minPlayer === maxPlayer) {
      return (
        <CardSubtitle>Players {minPlayer}</CardSubtitle>
      )
    }
    return (
      <CardSubtitle>Players {minPlayer} - {maxPlayer}</CardSubtitle>
    )
  }

  render () {
    return (
      <>
        {(SessionStore.isAdmin) && <Button color="link" onClick={() => this.openGameDetails('new')}>Create Game</Button>}
        <Row className="games">
          {
            this.props.games.map(game => (
              <Col md={3} sm={6} key={game.id}>
                <Card className={game.playerCount && game.playerCount.perTeamMax && game.playerCount.perTeamMax > 1 ? 'team' : 'vs'} onClick={() => this.openGameDetails(game.id)}>
                  {game.image && <CardImg src={game.image} alt={game.name} />}
                  <CardBody>
                    <CardTitle>{game.name}</CardTitle>
                    {this.playerCount(game)}
                    <CardText dangerouslySetInnerHTML={{__html: game.description}}/>
                  </CardBody>
                  <CardFooter>
                    <GameLink className="col-12 btn btn-secondary" game={game} title="Details"/>
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
