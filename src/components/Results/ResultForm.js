import React, { Component } from 'react'
import { withFirebase } from '../Firebase'
import { Col, Form, FormGroup, Input, Label, Row } from 'reactstrap'
import { DateTimePicker } from 'react-widgets'
import 'react-widgets/lib/scss/react-widgets.scss'

class ResultForm extends Component {

  constructor (props) {
    super(props)

    let state = {
      authorID: null,
      id: false,
      date: this.props.firebase.getCurrentDate(),
      gameID: null,
      image: null,
      location: null,
      notes: "",
      playerIDs: [],
      scores: [
        {score: 0, players: [{nick: ""}]}
      ],
    }
    if (this.props.result) {
      state = {
        ...this.props.result,
        gameName: this.props.result.game.name,
        dateJS: this.props.result.date.toDate(),
      }
      state.scores = state.scores.map((score) => {
        score.players.push({nick: ""})
        return score
      })
      state.scores.push({score: 0, players: [{nick: ""}]})
    }
    else {
      state.gameName = ""
      state.dateJS = state.date.toDate()
    }

    this.state = state
  }

  onChange = (data) => {
    this.setState(data)
  }

  onChangeScore = (i, score) => {
    let scores = this.state.scores
    scores[i].score = score
    scores = scores.filter((score) => !this.isScoreEmpty(score))
    scores.push({score: 0, players: [{nick: ''}]})
    this.onChange({ scores })
  }

  onChangePlayer = (i, j, playerName) => {
    let scores = this.state.scores
    scores[i].players[j] = { nick: playerName }
    scores[i].players = scores[i].players.filter(player => player.nick !== '')
    scores = scores.filter((score) => !this.isScoreEmpty(score))
    scores[i].players.push({nick: ''})
    scores.push({score: 0, players: [{nick: ''}]})
    this.onChange({ scores })
  }

  isScoreEmpty = (score) => {
    return !score.score && (score.players.length === 0 || (score.players.length === 1 && score.players[0].nick === ''))
  }

  render() {
    return (
      <Form>
        <FormGroup row>
          <Label for="dateJS" sm={2}>Date</Label>
          <Col sm={10}>
            <DateTimePicker name="dateJS" placeholder="Date" value={this.state.dateJS} onChange={dateJS => this.onChange({dateJS})} />
          </Col>
        </FormGroup>
        <FormGroup row>
          <Label for="gamename" sm={2}>Game</Label>
          <Col sm={10}>
            <Input type="text" placeholder="Game" value={this.state.gameName} onChange={event => this.onChange({gameName: event.target.value})}/>
          </Col>
        </FormGroup>
        {
          this.state.scores.map((score, i) => (
            <FormGroup key={i}>
              <Row>
                <Col>Team {i+1}</Col>
              </Row>
              <Row>
                <Label for={`scores[${i}][score]`} sm={{size: 2, offset: 1}}>Score</Label>
                <Col sm={9}>
                  <Input type="text" placeholder="Score" value={score.score} onChange={event => this.onChangeScore(i, event.target.value)}/>
                </Col>
              </Row>
              <Row>
                <Label for={`scores[${i}][players]`} sm={{size: 2, offset: 1}}>Players</Label>
                <Col sm={9}>
                  { score.players.map((player, j) => (
                    <Input key={j} type="text" placeholder="Nickname" value={player.nick} onChange={event => this.onChangePlayer(i, j, event.target.value)}/>
                  ))}
                </Col>
              </Row>
            </FormGroup>
          ))
        }
        <FormGroup row>
          <Label for="notes" sm={2}>Note</Label>
          <Col sm={10}>
            <Input type="textarea" placeholder="Notes" value={this.state.notes} rows={5} onChange={event => this.onChange({notes: event.target.value})}/>
          </Col>
        </FormGroup>
      </Form>
    )
  }

}

export default withFirebase(ResultForm)