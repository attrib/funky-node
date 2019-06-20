import React, { Component } from 'react'
import { Table } from 'reactstrap'
import { Link } from 'react-router-dom'
import * as ROUTES from '../../constants/routes'
import Funkies from './Funkies'
import AuthUserContext from '../Session/context'

class RecentResults extends Component {

  render() {
    const { results } = this.props
    if (results.length === 0) return (<p>No results yet</p>)
    return (
      <Table>
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
            }}>{ new Intl.DateTimeFormat('de-DE', {
              year: 'numeric',
              month: 'long',
              day: '2-digit',
              hour: 'numeric',
              minute: 'numeric'
            }).format(result.date.toDate()) }</Link></td>
            { this.props.showGames && <td><Link to={`${ROUTES.GAMES}/${result.gameID}`}>{result.game.name}</Link></td> }
            <td><Winner result={result} /></td>
            <td><Score result={result}/></td>
            { this.props.showNotes && <td>{result.notes}</td> }
          </tr>
        ))}
        </tbody>
      </Table>
    )
  }
}

const Winner = ({result, funkies}) => {
  funkies = !!funkies
  const max = result.scores.reduce((max, value) => (value.score > max.score) ? value : max)
  const scores = result.scores.filter((value) => value.score === max.score).sort((a, b) => {
    if (a.score > b.score) return -1
    if (a.score < b.score) return 1
    return 0
  })
  return scores.map((score, i) => (
    <div key={result.id + 'w' + i}>
      {(funkies && score.funkies) && <Funkies funkies={score.funkies} />} <PlayerNames players={score.players}/> ({score.score})
    </div>
  ))
}

const Score = ({result, funkies}) => {
  funkies = !!funkies
  const max = result.scores.reduce((max, value) => (value.score > max.score) ? value : max)
  const scores = result.scores.filter((value) => value.score < max.score).sort((a, b) => {
    if (a.score > b.score) return -1
    if (a.score < b.score) return 1
    return 0
  })
  return scores.map((score, i) => (
    <div key={result.id + 'w' + i}>
      {(funkies && score.funkies) && <Funkies funkies={score.funkies} />} <PlayerNames players={score.players}/> ({score.score})
    </div>
  ))
}

const PlayerNames = ({players}) => {
  return players.map((player, i) => (
    <AuthUserContext.Consumer key={player.nick}>
      {authUser => (
        <>
          { (authUser && player.id in authUser.players) && <strong><PlayerLink player={player}/></strong>}
          { (!authUser || !(player.id in authUser.players)) && <PlayerLink player={player}/>}
          {i < players.length - 1 && ', '}
        </>
      )}
    </AuthUserContext.Consumer>
  ))
}

const PlayerLink = ({player}) => {
  return (
    <Link to={{ pathname: ROUTES.PLAYER.replace(':id', player.id), state: {player}}}>{player.nick}</Link>
      )
}


export default RecentResults
export { Winner, Score, PlayerNames }