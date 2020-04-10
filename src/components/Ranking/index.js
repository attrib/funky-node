import React, { Component } from 'react'
import { Container } from 'reactstrap'
import { withFirebase } from '../Firebase'
import RankingTable from './RankingTable'
import withSeason from '../Season/withSeason'

class Ranking extends Component {

  constructor (props) {
    super(props)

    this.state = {
      loading: false,
      ranking: null,
    }
  }

  componentDidMount () {
    this.updateRankings()
  }

  componentDidUpdate () {
    this.updateRankings()
  }

  updateRankings = () => {
    if ((this.state.ranking && this.props.seasonPrefix === this.state.ranking.loadedSeasonPrefix) || this.state.loading) {
      return
    }

    this.setState({loading: true})

    this.props.firebase.ranking('all', this.props.seasonPrefix)
      .then(ranking => {
        let promises = []
        ranking.loadedSeasonPrefix = this.props.seasonPrefix
        ranking.players.forEach((player) => {
          promises.push(this.props.firebase.stats(player.id, this.props.seasonPrefix))
        })
        return Promise.all(promises)
          .then((stats) => {
            ranking.players = ranking.players.map((player) => {
              stats.forEach((stat) => {
                if (stat.id === player.id) {
                  player.stats = stat
                  player.funkyDiff = stat.sum - stat.played + 1
                  player.won = stat.won
                  player.played = stat.played
                  player.wonPercentage = stat.won / stat.played * 100
                }
              })
              return player
            })
            return ranking
          })
      })
      .then((ranking) => {
        this.setState({
          ranking,
          loading: false,
        })
      })
  }

  render () {
    const {loading, ranking} = this.state
    return (
      <div>
        <Container>
          {loading && <div>Loading ...</div>}
          {ranking && <RankingTable ranking={ranking}/>}
        </Container>
      </div>
    )
  }

}

export default withSeason(withFirebase(Ranking))