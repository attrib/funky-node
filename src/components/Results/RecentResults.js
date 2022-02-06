import React, { Component } from 'react'
import { Table } from 'reactstrap'
import { Link } from 'react-router-dom'
import * as ROUTES from '../../constants/routes'
import Score from './Score'
import GameLink from '../Games/GameLink'
import {FormattedDateTime} from '../Utils/FormattedDate'
import BackendService from "../../services/BackendService";
import {reaction} from "mobx";
import SeasonStore from "../../stores/SeasonStore";

class RecentResults extends Component {

  static defaultProps = {
    filter: {
      limit: 100,
    },
    showGames: false,
    showNotes: false,
  }

  constructor (props) {
    super(props)

    this.state = {
      results: [],
    }
    this.resultService = new BackendService('result')
  }

  componentDidMount() {
    this.loadResults()
    reaction(
      () => SeasonStore.selectedSeason,
      () => {
        this.loadResults()
      })
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.filter !== this.props.filter) {
      this.loadResults()
    }
  }

  loadResults() {
    if (SeasonStore.selectedSeason.id) {
      let filter = {...this.props.filter}
      if (SeasonStore.selectedSeason.id !== 'all') {
        filter.tag = SeasonStore.selectedSeason.id
      }
      this.resultService.get(filter).then((results) => {
        this.setState({results})
      })
    }
  }

  render() {
    const { results } = this.state
    if (results.length === 0) return (<p>No results yet</p>)
    return (
      <Table hover>
        <thead>
          <tr>
            <th>Date</th>
            { this.props.showGames && <th>Game</th> }
            <th>Winner</th>
            <th>Scores</th>
            { this.props.showNotes && <th>Notes</th> }
          </tr>
        </thead>
        <tbody>
        { results.map(result => (
          <tr key={result.id}>
            <td><Link to={{
              pathname: `${ROUTES.RESULTS}/${result.id}`,
              state: {result}
            }}><FormattedDateTime date={result.date}/></Link></td>
            { this.props.showGames && <td><GameLink game={result.game} /></td> }
            <td><Score winners result={result} /></td>
            <td><Score losers result={result} /></td>
            { this.props.showNotes && <td>{result.notes}</td> }
          </tr>
        ))}
        </tbody>
      </Table>
    )
  }
}

export default RecentResults