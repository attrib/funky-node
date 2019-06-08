import React, { Component } from 'react'
import { AuthUserContext, withAuthorization } from '../Session'
import { Col, Container, Jumbotron, Row } from 'reactstrap'
import UserRecentResults from './UserRecentResults'

class HomePage extends Component {
  render () {
    return (
      <AuthUserContext.Consumer>
        {authUser =>
          <div>
            <Jumbotron>
              <Container>
                <Row>
                  <Col>
                    <h1>Welcome {authUser.username}</h1>
                  </Col>
                </Row>
              </Container>
            </Jumbotron>
            <Container>
              <h2>Your recent results</h2>
              <UserRecentResults user={authUser}/>
            </Container>
          </div>
        }
      </AuthUserContext.Consumer>
    )
  }
}

const condition = authUser => !!authUser

export default withAuthorization(condition)(HomePage)