import React, { Component } from 'react'
import { Table } from 'reactstrap'

class RecentResults extends Component {

  render() {
    const { results } = this.props
    return (
      <Table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Winner</th>
            <th>Scores</th>
          </tr>
        </thead>
        <tbody>
        { results.map(result => (
          <tr key={result.id}>
            <td>{ new Intl.DateTimeFormat('de-DE', {
              year: 'numeric',
              month: 'long',
              day: '2-digit',
              hour: 'numeric',
              minute: 'numeric'
            }).format(result.date.toDate()) }</td>
            <td><Winner result={result} /></td>
            <td><Score result={result}/></td>
          </tr>
        ))}
        </tbody>
      </Table>
    )
  }
}

const Winner = ({result}) => {
  const max = result.scores.reduce((max, value) => (value.score > max.score) ? value.score : max)
  const scores = result.scores.filter((value) => value.score === max.score).sort((a, b) => {
    if (a.score > b.score) return -1
    if (a.score < b.score) return 1
    return 0
  })
  return scores.map((score, i) => (
    <div key={result.id + 'w' + i}>
      {score.players.map((player) => player.nick).join(', ')} ({score.score})
    </div>
  ))
}

const Score = ({result}) => {
  const max = result.scores.reduce((max, value) => (value.score > max.score) ? value.score : max)
  const scores = result.scores.filter((value) => value.score < max.score).sort((a, b) => {
    if (a.score > b.score) return -1
    if (a.score < b.score) return 1
    return 0
  })
  return scores.map((score, i) => (
    <div key={result.id + 'w' + i}>
      {score.players.map((player) => player.nick).join(', ')} ({score.score})
    </div>
  ))
}


export default RecentResults