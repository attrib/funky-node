import React, { Component } from 'react'
import { compose } from 'recompose'
import { withFirebase } from '../Firebase'
import RecentResults from '../Results/RecentResults'

class UserRecentResults extends Component {

  constructor (props) {
    super(props)

    this.state = {
      loading: false,
      results: null,
    }
  }

  componentDidMount () {
    if (this.state.results) {
      return
    }
    this.setState({loading: true})
    let promises = [];
    Object.keys(this.props.user.players).forEach((playerID) => promises.push(this.props.firebase.resultsByPlayerId(playerID)))
    Promise.all(promises)
      .then((snapshotsList) => {
        const results = []
        snapshotsList.forEach((snapshots) => {
          snapshots.forEach((snapshot) => {
            results.push({
              ...snapshot.data(),
              id: snapshot.id
            })
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
  }

  render() {
    const { results, loading } = this.state
    const { user } = this.props
    if (loading) return (<p>loading</p>)
    else if (results && results.length > 0) return (<RecentResults showGames results={results}/>)
    else if (Object.keys(user.players).length > 0) return (<p>No game results found. Play something!</p>)
    else return (<p>No user linked to account</p>)
  }

}

export default compose(
  withFirebase
)(UserRecentResults)