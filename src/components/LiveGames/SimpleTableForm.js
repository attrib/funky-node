import React, { Component } from 'react'
import { FormFeedback, Input, Table } from 'reactstrap'
import { Combobox } from 'react-widgets'
import PlayerNames from '../Player/PlayerNames'
import {toJS} from "mobx";

class SimpleTableForm extends Component {

  onChange = (data) => {
    this.props.onChange(data);
  }

  onChangeScore = (team, counter, score) => {
    let {scores, error} = this.props
    // populate liveScore
    if (scores[team].liveScore.length <= counter) {
      scores[team].liveScore = scores[team].liveScore.concat(new Array(counter - scores[team].liveScore.length + 1).fill(''))
    }
    // for better typing allow -, 0 and empty string
    // otherwise you have to type 11 and then - (-11)
    if (score !== '-0' && score !== '' && score !== '-' && !isNaN(Number(score))) {
      scores[team].liveScore[counter] = Number(score)
      delete error[`scores[${team}][liveScore][${counter}]`]
    }
    else {
      scores[team].liveScore[counter] = score
      error[`scores[${team}][liveScore][${counter}]`] = 'Invalid number'
    }

    // filter out empty lines
    let deleteLine = true
    scores.forEach((score, team) => {
      if (score.liveScore[counter] && score.liveScore[counter] !== '') {
        deleteLine = false
      }
    })
    if (deleteLine) {
      scores.forEach((score, team) => {
        delete error[`scores[${team}][liveScore][${counter}]`]
        score.liveScore.splice(counter, 1)
      })
    }

    // call total score
    scores[team].score = scores[team].liveScore.reduce((agg, point) => !isNaN(Number(point)) ? agg + Number(point): agg, 0)

    this.onChange({scores})

    // start timer for scoreUpdate
    if (this.timer) {
      clearTimeout(this.timer)
    }
    this.timer = setTimeout(this.scoreUpdate, 2000)
  }

  scoreUpdate = () => {
    this.timer = null
    if (this.props.scoreUpdate) {
      this.props.scoreUpdate()
    }
  }

  onChangePlayer = (i, j, playerName) => {
    let player = {}
    if (typeof playerName === 'string') {
      player = { nick: playerName }
    }
    else {
      player = playerName
    }
    let scores = this.props.scores
    scores[i].players[j] = player
    scores[i].players = scores[i].players.filter(player => player.nick !== '')
    scores = scores.filter((score) => !this.props.isScoreEmpty(score))
    scores.push({score: 0, players: [{nick: ''}], liveScore: []})
    scores[i].players.push({nick: ''})

    let playerIDs = [], playerNames = []
    scores.forEach(score => score.players.forEach(player => {
      playerIDs.push(player.id)
      playerNames.push(player.nick)
    }))
    playerIDs = playerIDs.filter((value, index, self) => typeof value !== 'undefined' && value !== '' && self.indexOf(value) === index)
    playerNames = playerNames.filter((value, index, self) => typeof value !== 'undefined' && value !== '' && self.indexOf(value) === index)
    this.onChange({ scores, playerIDs, playerNames })
  }

  render () {
    const { scores, error, isNew } = this.props

    let liveScore = []
    scores.forEach((score, i) => {
      if (!score.liveScore) {
        score.liveScore = []
      }
      score.liveScore.forEach((point ,j) => {
        if (!liveScore[j]) {
          liveScore[j] = new Array(scores.length).fill('')
        }
        liveScore[j][i] = point
      })
    })
    // add first player entry
    if (scores.length === 0) {
      scores.push({score: 0, players: [{nick: ''}], liveScore: []})
    }
    // add new line at the end
    liveScore.push(new Array(scores.length).fill(''))

    return (
      <Table style={{textAlign: 'center'}}>
        <thead>
          <tr>
            {scores.map((score, i) => (
              <th key={`thead-players-${i}`}>
                {isNew && (
                  <>
                    {score.players.map((player, j) => (
                      <Combobox key={`thead-players-${i}-${j}`} placeholder="Nickname" value={player} textField="nick" data={this.props.playerList}
                                busy={this.props.playerList === null} filter={this.props.filterSelectablePlayers}
                                onChange={value => this.onChangePlayer(i, j, value)} name={`scores[${i}][players][${j}]`}
                                autoComplete="off"/>
                    ))}
                  </>
                )}
                {!isNew && <PlayerNames players={score.players} />}
              </th>
            ))}
          </tr>
        <tr>
          {scores.map((score, i) => (
            <th key={`thead-score-${i}`}>
              {score.score}
            </th>
          ))}
        </tr>
        </thead>
        <tbody>
          { isNew && (
            <tr>
              <td colSpan={scores.length}>To start the game, save once. After that the team can't be changed anymore</td>
            </tr>
          )}
          { !isNew && (
            <>
            {liveScore.map((teams, i) => (
                <tr key={`tbody-score-${i}`}>
                  {teams.map((points, j) => (
                    <td key={`tbody-score-${i}-${j}`}>
                      <Input type="Number" value={points}
                             onChange={event => this.onChangeScore(j, i, event.target.value)}
                             name={`scores[${j}][liveScore][${i}]`} autoComplete="off" invalid={!!error[`scores[${j}][liveScore][${i}]`]} />
                      {error[`scores[${j}][liveScore][${i}]`] && <FormFeedback>{error[`scores[${j}][liveScore][${i}]`]}</FormFeedback>}
                    </td>
                  ))}
                </tr>
              ))}
            </>
          )}
        </tbody>
      </Table>
    )
  }

}

export default SimpleTableForm