import React, { Component } from 'react'
import { compose } from 'recompose'
import { withFirebase } from '../Firebase'
import RecentResults from '../Games/RecentResults'

class UserRecentResults extends Component {

  constructor (props) {
    super(props)

    this.state = {
      loading: false,
      results: null,
      playerIds: [],
    }
  }

  componentDidMount () {
    if (this.state.results) {
      return
    }
    this.setState({loading: true})
    let playerIds = []
    this.props.firebase.playerByUID(this.props.user.uid)
      .then((snapshots) => {
        snapshots.forEach((snapshot) => {
          playerIds.push(snapshot.id)
        })
        this.setState({playerIds})
        return this.props.firebase.games()
      })
      .then((snapshots) => {
        let promises = []
        snapshots.forEach((snapshot) => {
          playerIds.forEach((playerId) => {
            promises.push(snapshot.ref.collection('results').where('playerIDs', 'array-contains', playerId).get())
          })
        })
        return Promise.all(promises)
      })
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
        this.props.firebase.resultsResolvePlayers(results)
          .then((results) => {
            this.setState({
              results,
              loading: false
            })
          })
      })
  }

  render() {
    const { results, loading, playerIds } = this.state
    if (loading) return (<p>loading</p>)
    else if (results && results.length > 0) return (<RecentResults results={results}/>)
    else if (playerIds.length > 0) return (<p>No game results found. Play something!</p>)
    else return (<p>No user linked to account</p>)
  }

}

export default compose(
  withFirebase
)(UserRecentResults)