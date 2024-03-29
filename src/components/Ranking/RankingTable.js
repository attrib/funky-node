import React, { PureComponent } from 'react'
import Funkies from '../Results/Funkies'
import { Table } from 'reactstrap'
import { FaSortDown } from 'react-icons/fa'
import { GiTwoCoins } from 'react-icons/gi'
import PlayerNames from '../Player/PlayerNames'
import BackendService from "../../services/BackendService";
import GameLink from "../Games/GameLink";
import {reaction} from "mobx";
import SeasonStore from "../../stores/SeasonStore";
import TeamLink from "../Team/TeamLink";

class RankingTable extends PureComponent {

  static defaultProps = {
    filter: {}
  }

  constructor (props) {
    super(props)

    this.state = {
      ranking: [],
      sort: 'funkyDiff',
    }
    this.rankingService = new BackendService('ranking')
  }

  componentDidMount() {
    this.loadRankings(this.state.sort)
    reaction(
      () => SeasonStore.selectedSeason,
      () => {
        this.loadRankings(this.state.sort)
      })
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (JSON.stringify(prevProps.filter) !== JSON.stringify(this.props.filter)) {
      this.loadRankings(this.state.sort)
    }
  }

  loadRankings = (sort) => {
    this.setState({ranking: []})
    if (SeasonStore.selectedSeason.id) {
      let filter = {...this.props.filter, sort: sort}
      if (SeasonStore.selectedSeason.id !== 'all') {
        filter.tag = SeasonStore.selectedSeason.id
      }
      this.rankingService.get(filter).then((ranking) => {
        this.setState({ranking, sort})
      })
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
    this.loadRankings(field)
  }

  render () {
    const {ranking, sort} = this.state
    const rankByPlayer = (!(this.props.filter.by && this.props.filter.by === 'game'));
    const firstColumn = (player) => {
      const rankBy = this.props.filter.by || 'player'
      switch (rankBy) {
        default:
        case 'player':
          return <PlayerNames players={[player]}/>

        case 'team':
        case 'single':
          return <TeamLink team={player}/>

        case 'team_game':
        case 'game':
          return <GameLink game={player}/>
      }
    }

    return (
      <Table hover>
        <thead>
        <tr>
          {rankByPlayer && <th>#</th>}
          <th>{rankByPlayer ? 'Player' : 'Game'}</th>
          <th onClick={() => this.onSort('funkies')}>Average{sort === 'funkies' && <FaSortDown />}</th>
          <th onClick={() => this.onSort('funkyDiff')}>Credit{sort === 'funkyDiff' && <FaSortDown />}</th>
          <th onClick={() => this.onSort('wonPercentage')}>Won{sort === 'wonPercentage' && <FaSortDown />}</th>
        </tr>
        </thead>
        <tbody>
        {ranking.map((player, i) => (
          <tr key={player.id}>
            {rankByPlayer && <td>{i+1}</td>}
            <td>{firstColumn(player)}</td>
            <td>{player.funkies.toFixed(2).replace('.', ',')} <GiTwoCoins style={{color: 'yellowgreen'}}/></td>
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