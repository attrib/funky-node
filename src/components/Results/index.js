import React, { Component } from 'react'
import { Container } from 'reactstrap'
import RecentResults from './RecentResults'

class Results extends Component {

  render () {
    return (
      <div>
        <Container>
          <RecentResults showGames showNotes/>
        </Container>
      </div>
    )
  }
}

export default Results