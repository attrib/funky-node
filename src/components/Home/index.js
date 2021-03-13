import React, { Component } from 'react'
import { Col, Container, Jumbotron, Row } from 'reactstrap'
import UserRecentResults from './UserRecentResults'
import SessionStore from "../../stores/SessionStore";

class HomePage extends Component {
  render () {
    return (
      <div>
        <Jumbotron>
          <Container>
            <Row>
              <Col>
                <h1>Welcome {SessionStore.user.username}</h1>
              </Col>
            </Row>
          </Container>
        </Jumbotron>
        <Container>
          <h2>Your recent results</h2>
          <UserRecentResults user={SessionStore.user}/>
        </Container>
      </div>

    )
  }
}

const condition = authUser => !!authUser

export default HomePage