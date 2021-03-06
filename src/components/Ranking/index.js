import React, { Component } from 'react'
import { Container } from 'reactstrap'
import RankingTable from './RankingTable'

class Ranking extends Component {

  render () {
    return (
      <div>
        <Container>
          <RankingTable/>
        </Container>
      </div>
    )
  }

}

export default Ranking