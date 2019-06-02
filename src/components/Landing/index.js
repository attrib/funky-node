import React from 'react'
import { Col, Container, Jumbotron, Row } from 'reactstrap'
import './Landing.css'
import NewsList from './NewsList'

const LandingPage = () => (
  <div>
    <Jumbotron>
      <Container>
        <Row>
          <Col>
            <h1>Welcome to funky-clan 2019 edition</h1>
            <p>board and card game statistics for competitive gamers and statistic nerds</p>
          </Col>
        </Row>
      </Container>
    </Jumbotron>
    <Container>
      <NewsList/>
    </Container>
  </div>
)

export default LandingPage