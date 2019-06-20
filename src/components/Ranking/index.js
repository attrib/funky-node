import React, { Component } from 'react'
import { Container } from 'reactstrap'
import { withFirebase } from '../Firebase'
import RankingTable from './RankingTable'

class Ranking extends Component {

  constructor (props) {
    super(props)

    this.state = {
      loading: false,
      ranking: null,
    }
  }

  componentDidMount () {
    if (this.state.ranking) {
      return
    }

    this.setState({loading: true})

    this.props.firebase.ranking('all')
      .then(ranking => {
        let promises = []
        ranking.players.forEach((player) => {
          promises.push(this.props.firebase.stats(player.id))
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

export default withFirebase(Ranking)