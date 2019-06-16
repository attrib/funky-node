import React, { Component } from 'react'
import { withFirebase } from '../Firebase'
import { Col, Form, FormGroup, Input, Label, Row } from 'reactstrap'
import { DateTimePicker } from 'react-widgets'
import { Combobox } from 'react-widgets'
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
      playerNames: [],
      scores: [
        {score: 0, players: [{nick: ""}]}
      ],
      gameList: null,
      playerList: null,
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

  componentDidMount() {
    this.loadGames()
    this.loadPlayers()
  }

  loadGames = () => {
    if (this.state.gameList) {
      return
    }
    this.props.firebase.games()
      .then((snapshots) => {
        let gameList = []
        snapshots.forEach((snapshot) => {
          gameList.push({
            ...snapshot.data(),
            id: snapshot.id,
          })
        })
        this.setState({gameList})
      })
  }

  loadPlayers = () => {
    if (this.state.playerList) {
      return
    }
    this.props.firebase.players()
      .then((snapshots) => {
        let playerList = []
        snapshots.forEach((snapshot) => {
          playerList.push({
            ...snapshot.data(),
            id: snapshot.id,
          })
        })
        this.setState({playerList})
      })
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
    let player = {}
    if (typeof playerName === 'string') {
      player = { nick: playerName }
    }
    else {
      player = playerName
    }
    let scores = this.state.scores
    scores[i].players[j] = player
    scores[i].players = scores[i].players.filter(player => player.nick !== '')
    scores = scores.filter((score) => !this.isScoreEmpty(score))
    scores[i].players.push({nick: ''})
    scores.push({score: 0, players: [{nick: ''}]})

    let playerIDs = [], playerNames = []
    scores.forEach(score => score.players.forEach(player => {
      playerIDs.push(player.id)
      playerNames.push(player.name)
    }))
    playerIDs = playerIDs.filter((value, index, self) => self.indexOf(value) === index)
    playerNames = playerNames.filter((value, index, self) => self.indexOf(value) === index)
    this.onChange({ scores, playerIDs, playerNames })
  }

  filterSelectablePlayers = (player, value) => {
    if (player.nick === value) return true
    return this.state.playerNames.indexOf(player.nick) !== 0
  }

  onChangeGame = (value) => {
    if (typeof value === 'string') {
      this.setState({
        game: {
          name: value,
        }
      })
    }
    else {
      this.setState({
        game: value
      })
    }
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
            <DateTimePicker name="dateJS" placeholder="Date" value={this.state.date.toDate()} onChange={dateJS => this.onChange({date: this.props.firebase.Timestamp.fromDate(dateJS)})} />
          </Col>
        </FormGroup>
        <FormGroup row>
          <Label for="gamename" sm={2}>Game</Label>
          <Col sm={10}>
            <Combobox value={this.state.game} data={this.state.gameList} busy={this.state.gameList === null} textField="name" placeholder="Game" onChange={this.onChangeGame}/>
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
                    <Combobox key={j} placeholder="Nickname" value={player} textField="nick" data={this.state.playerList} busy={this.state.playerList === null} filter={this.filterSelectablePlayers} onChange={value => this.onChangePlayer(i, j, value)}/>
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
