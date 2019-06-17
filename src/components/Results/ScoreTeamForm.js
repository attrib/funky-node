import React, { Component } from 'react'
import { Col, FormFeedback, FormGroup, Input, Label, Row } from 'reactstrap'
import { Combobox } from 'react-widgets'

class ScoreTeamForm extends Component {

  onChange = (data) => {
    this.props.onChange(data);
  }

  onChangeScore = (i, score) => {
    let {scores, error} = this.props
    // for better typing allow -, 0 and empty string
    // otherwise you have to type 11 and then - (-11)
    if (score !== '-0' && score !== '' && score !== '-' && !isNaN(Number(score))) {
      scores[i].score = Number(score)
      delete error[`scores[${i}][score]`]
    }
    else {
      scores[i].score = score
      error[`scores[${i}][score]`] = 'Invalid number'
    }
    scores = scores.filter((score) => !this.props.isScoreEmpty(score))
    scores.push({score: 0, players: [{nick: ''}]})
    this.onChange({ scores })
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
    scores[i].players.push({nick: ''})
    scores.push({score: 0, players: [{nick: ''}]})

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
    const {scores, error } = this.props
    return (
      <>
        {scores.map((score, i) => (
          <FormGroup key={i}>
            <Row>
              <Col>Team {i + 1}</Col>
            </Row>
            <Row>
              <Label for={`scores[${i}][score]`} sm={{size: 2, offset: 1}}>Score</Label>
              <Col sm={9}>
                <Input type="number" placeholder="Score" value={score.score}
                       onChange={event => this.onChangeScore(i, event.target.value)} name={`scores[${i}][score]`}
                       autoComplete="off" invalid={!!error[`scores[${i}][score]`]}/>
                {error[`scores[${i}][score]`] &&
                <FormFeedback>{error[`scores[${i}][score]`]}</FormFeedback>}
              </Col>
            </Row>
            <Row>
              <Label for={`scores[${i}][players]`} sm={{size: 2, offset: 1}}>Players</Label>
              <Col sm={9}>
                {score.players.map((player, j) => (
                  <Combobox key={j} placeholder="Nickname" value={player} textField="nick" data={this.props.playerList}
                            busy={this.props.playerList === null} filter={this.props.filterSelectablePlayers}
                            onChange={value => this.onChangePlayer(i, j, value)} name={`scores[${i}][players][${j}]`}
                            autoComplete="off"/>
                ))}
              </Col>
            </Row>
          </FormGroup>
        ))}
      </>
    )
  }

}

export default ScoreTeamForm