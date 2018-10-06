import React, { Component } from 'react';
import {
  Container,
  Row,
  Col,
  Jumbotron,
} from 'reactstrap';
import './Home.css';

class Home extends Component {
  render() {
    return <div>
      <Jumbotron>
        <Container>
          <Row>
            <Col>
              <h1>Welcome to funky-clan 2018 edition</h1>
              <p>board and card game statistics for competitive gamers and statistic nerds</p>
            </Col>
          </Row>
        </Container>
      </Jumbotron>
      <Container>
        <Row className="news">
          <Col className="news-entry">
            <h2>New beginnings</h2>
            <div className="date">06.10.2018</div>
            <p>
              Neuer Versuch im Jahre 2018.
            </p>
            <p>
              Nach langer Abwesenheit gibt es wieder die funky Statistiken.
            </p>
            <p>
              Wie immer alles im Aufbau mit Bugs und neuem Design ;)<br/>Wer helfen wir kann das immer gern tun. Egal ob Design Vorschläge, Bug Reports, Feature Requests oder gar am Code mitschrauben will. Meldet euch einfach bei mir.
            </p>
            <p>Sourcecode findet ihr auf <a href="https://github.org/attrib/funky-node">github</a>.</p>
          </Col>
        </Row>
      </Container>
    </div>
  }
}

export default Home