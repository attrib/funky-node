import Funkies from './Funkies'
import PlayerNames from '../Player/PlayerNames'
import React from 'react'

const Score = ({result, funkies, winners, losers}) => {
  funkies = !!funkies
  const max = result.scores.reduce((max, value) => (value.score > max.score) ? value : max)
  let scores = result.scores
  if (winners) {
    scores = result.scores.filter((value) => value.score === max.score)
  }
  else if (losers) {
    scores = result.scores.filter((value) => value.score < max.score)
  }
  scores.sort((a, b) => {
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

export default Score