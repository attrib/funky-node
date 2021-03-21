import React, { Component } from 'react'
import { Container } from 'reactstrap'
import TabbedRankingTable from "./TabbedRankingTable";

class Ranking extends Component {

  render () {
    return (
      <div>
        <Container>
          <TabbedRankingTable />
        </Container>
      </div>
    )
  }

}

export default Ranking