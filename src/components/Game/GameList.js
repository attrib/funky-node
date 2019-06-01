import React, { Component } from 'react';
import {Col, Row} from "reactstrap";


class GameList extends Component {

  render() {
    return (
      <Row className="games">
        {
          this.props.games.map(game => (
            <Col className="game" key={game.id}>
              <h2>{game.name}</h2>
              <p>{game.description}</p>
            </Col>
          ))
        }
      </Row>
    )
  }

}

export default GameList;
