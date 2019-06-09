import React, { Component } from 'react'
import { compose } from 'recompose'
import { withFirebase } from '../Firebase'
import { Container } from 'reactstrap'
import RecentResults from './RecentResults'

class Results extends Component {

  constructor (props) {
    super(props)

    this.state = {
      loading: false,
      results: [],
    }
  }

  componentDidMount () {
    this.setState({loading: true})

    this.props.firebase.results()
      .then(snapshot => {
        let results = []
        snapshot.forEach(document => {
          results.push({
            ...document.data(),
            id: document.id,
          })
        })
        return this.props.firebase.resultsResolvePlayers(results)
      })
      .then((results) => {
        this.setState({
          results,
          loading: false
        })
      })
      .catch(error => console.log(error))
  }

  render () {
    const {results, loading} = this.state

    return (
      <div>
        <Container>
          {loading && <div>Loading ...</div>}
          <RecentResults results={results} showGames showNotes/>
        </Container>
      </div>
    )
  }
}

export default compose(
  withFirebase,
)(Results)