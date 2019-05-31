import React, {Component} from 'react';

import {AuthUserContext, withAuthorization} from '../Session';
import {Col, Container, Jumbotron, Row} from "reactstrap";
import { compose } from 'recompose';

class HomePage extends Component {
  render() {
    return (<AuthUserContext.Consumer>
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
            <Row>
              <Col>
                <h2>Current Ranking</h2>
              </Col>
              <Col>
                <h2>Your latest results</h2>
              </Col>
            </Row>
          </Container>
        </div>
      }
    </AuthUserContext.Consumer>)
  }
}

const condition = authUser => !!authUser;

export default compose(
  withAuthorization(condition),
)(HomePage);
