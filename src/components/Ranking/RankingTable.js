import React, { Component } from 'react'
import Funkies from '../Results/Funkies'
import { Table } from 'reactstrap'
import { FaSortDown } from 'react-icons/fa'
import { GiTwoCoins } from 'react-icons/gi'
import PlayerNames from '../Player/PlayerNames'

class RankingTable extends Component {

  constructor (props) {
    super(props)

    this.sort(props.ranking, 'funkyDiff')
    this.state = {
      ranking: props.ranking,
      sort: 'funkyDiff',
    }
  }

  sort = (ranking, field) => {
    ranking.players.sort((a, b) => {
      if (a[field] > b[field]) return -1
      if (a[field] < b[field]) return 1
      return 0
    })
  }

  onSort = (field) => {
    if (this.state.sort === field) {
      return
    }
    let ranking = this.state.ranking
    this.sort(ranking, field)
    this.setState({ranking, sort: field})
  }

  render () {
    const {ranking, sort} = this.state
    return (
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
            <td><PlayerNames players={[player]}/></td>
            <td>{player.funkies.toFixed(2)} <GiTwoCoins style={{color: 'yellowgreen'}}/></td>
            <td><Funkies funkies={player.funkyDiff} /></td>
            <td>{player.won} / {player.played} ({player.wonPercentage.toFixed(0)}%)</td>
          </tr>
        ))}
        </tbody>
      </Table>
    )
  }

}

export default RankingTable