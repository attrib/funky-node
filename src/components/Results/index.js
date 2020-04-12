import React, { Component } from 'react'
import { compose } from 'recompose'
import { withFirebase } from '../Firebase'
import { Container } from 'reactstrap'
import RecentResults from './RecentResults'
import withSeason from '../Season/withSeason'

class Results extends Component {

  constructor (props) {
    super(props)

    this.state = {
      loading: false,
      results: [],
      lastSeason: null,
    }
  }

  componentDidMount () {
    this.updateResults()
  }

  componentDidUpdate (prevProps, prevState, snapshot) {
    this.updateResults()
  }

  updateResults = () => {
    if (this.state.loading || this.state.lastSeason === this.props.seasonPrefix) {
      return
    }

    this.setState({loading: true, results: []})
    this.props.firebase.resultsForSeason(this.props.selectedSeason)
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
          loading: false,
          lastSeason: this.props.seasonPrefix,
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
          {!loading && <RecentResults results={results} showGames showNotes/>}
        </Container>
      </div>
    )
  }
}

export default compose(
  withFirebase,
  withSeason
)(Results)