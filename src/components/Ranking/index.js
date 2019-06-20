import React, { Component } from 'react'
import { Container, Table } from 'reactstrap'
import { withFirebase } from '../Firebase'
import { GiTwoCoins } from 'react-icons/gi'
import Funkies from '../Results/Funkies'
import { FaSortDown } from 'react-icons/fa'

class Ranking extends Component {

  constructor (props) {
    super(props)

    this.state = {
      loading: false,
      ranking: null,
      sort: 'funkies'
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

  onSort = (field) => {
    if (this.state.sort === field) {
      return
    }
    let ranking = this.state.ranking
    ranking.players.sort((a, b) => {
      if (a[field] > b[field]) return -1
      if (a[field] < b[field]) return 1
      return 0
    })
    this.setState({ranking, sort: field})
  }

  render () {
    const {loading, ranking, sort} = this.state
    return (
      <div>
        <Container>
          {loading && <div>Loading ...</div>}
          {ranking && (
            <Table hover>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Player</th>
                  <th onClick={() => this.onSort('funkies')}>Average{sort === 'funkies' && <FaSortDown />}</th>
                  <th onClick={() => this.onSort('funkyDiff')}>Credit{sort === 'funkyDiff' && <FaSortDown />}</th>
                  <th onClick={() => this.onSort('wonPercentage')}>Won{sort === 'wonPercentage' && <FaSortDown />}</th>
                </tr>
              </thead>
              <tbody>
                {ranking.players.map((player, i) => (
                  <tr key={player.id}>
                    <td>{i+1}</td>
                    <td>{player.nick}</td>
                    <td>{player.funkies.toFixed(2)} <GiTwoCoins style={{color: 'yellowgreen'}}/></td>
                    <td><Funkies funkies={player.funkyDiff} /></td>
                    <td>{player.won} / {player.played} ({player.wonPercentage.toFixed(0)}%)</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Container>
      </div>
    )
  }

}

export default withFirebase(Ranking)