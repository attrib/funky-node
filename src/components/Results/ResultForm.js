import React, { Component } from 'react'
import { Alert, Button, ButtonGroup, Col, Form, FormGroup, Input, Label } from 'reactstrap'
import { DateTimePicker, DropdownList } from 'react-widgets'
import 'react-widgets/lib/scss/react-widgets.scss'
import ScoreTeamForm from './ScoreTeamForm'
import ScoreRankingForm from './ScoreRankingForm'
import { Link } from 'react-router-dom'
import * as ROUTES from '../../constants/routes'
import BackendService from "../../services/BackendService";
import SessionStore from "../../stores/SessionStore";

class ResultForm extends Component {

  constructor (props) {
    super(props)

    let state = {
      id: false,
      date: new Date(),
      game: null,
      image: null,
      location: null,
      notes: "",
      playerNames: [],
      scores: [
        {score: 0, players: [{nick: ""}]}
      ],
      gameList: [],
      playerList: [],
      error: {},
    }
    if (this.props.result) {
      state = {
        ...state,
        ...this.props.result,
        date: new Date(this.props.result.date)
      }
      state.scores = state.scores.map((score) => {
        score.players.push({nick: ""})
        return score
      })
      state.scores.push({score: 0, players: [{nick: ""}]})
    }

    this.state = state
    this.playerService = new BackendService('player')
    this.gameService = new BackendService('game')
    this.resultService = new BackendService('result')
  }

  componentDidMount() {
    this.loadGames()
    this.loadPlayers()
  }

  loadGames = () => {
    if (this.state.gameList.length) {
      return
    }
    this.gameService.get()
      .then((gameList) => {
        this.setState({gameList})
      })
  }

  loadPlayers = () => {
    if (this.state.playerList.length) {
      return
    }
    this.playerService.get()
      .then((playerList) => {
        this.setState({playerList})
      })
  }

  onChange = (data) => {
    this.setState(data)
  }

  filterSelectablePlayers = (player, value) => {
    if (player.nick === value) return true
    if (this.state.playerNames.indexOf(player.nick) === -1) {
      return player.nick.toLowerCase().startsWith(value.toLowerCase())
    }
    else {
      return false
    }
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

  onSave = () => {
    let result = {
      date: this.state.date,
      game: {name: this.state.game.name},
      image: this.state.image,
      location: this.state.location,
      notes: this.state.notes,
      scores: this.state.scores,
      tags: [{name: '' + this.state.date.getFullYear()}]
    }
    result.scores = result.scores.filter((score) => !this.isScoreEmpty(score))
    result.scores = result.scores.map((score) => {
      score.score = Number(score.score)
      score.players = score.players.filter(player => player.nick !== '')
      return score
    })

    if (this.state.id) {
      this.resultService.patch(this.state.id, result)
        .then((result) => {
          result.isNew = !this.state.id
          this.props.onSave(result)
        })
        .catch((error) => {
          console.log(error)
        })
    }
    else {
      this.resultService.post(result)
        .then((result) => {
          result.isNew = !this.state.id
          this.props.onSave(result)
        })
        .catch((error) => {
          console.log(error)
        })
    }
  }

  onDelete = () => {
    this.resultService.delete(this.state.id)
      .then(() => {
        if (this.props.onDelete) {
          this.props.onDelete(this.state.id)
        }
      })
      .catch((error) => {
        console.log(error)
      })
  }

  render() {
    const game = this.state.gameList.find(game => game.name.toLowerCase() === this.state.game.name.toLowerCase())
    const scoreWidget = (game && game.score_widget) ? game.score_widget : 'ScoreTeamForm'
    return (
      <Form onSubmit={(event) => event.preventDefault()}>
        <FormGroup row>
          <Label for="date" sm={2}>Date</Label>
          <Col sm={10}>
            <DateTimePicker name="date" placeholder="Date" value={this.state.date} onChange={date => this.onChange({date: date})} />
          </Col>
        </FormGroup>
        <FormGroup row>
          <Label for="gamename" sm={2}>Game</Label>
          <Col sm={10}>
            <DropdownList value={this.state.game} name="gamename" data={this.state.gameList} busy={this.state.gameList === null} textField="name" placeholder="Game" onChange={this.onChangeGame} filter="startsWith" />
          </Col>
        </FormGroup>
        {(() => {
          switch(scoreWidget) {
            case 'ScoreTeamForm':
              return <ScoreTeamForm scores={this.state.scores} error={this.state.error} playerList={this.state.playerList} filterSelectablePlayers={this.filterSelectablePlayers} isScoreEmpty={this.isScoreEmpty} onChange={this.onChange}/>;
            case 'ScoreRankingForm':
              return <ScoreRankingForm scores={this.state.scores} error={this.state.error} playerList={this.state.playerList} filterSelectablePlayers={this.filterSelectablePlayers} isScoreEmpty={this.isScoreEmpty} onChange={this.onChange} />
            default:
              return <Alert color="danger">Missing widget for <Link to={`${ROUTES.GAMES}/${this.state.game.id}`}>{this.state.game.name}</Link></Alert>;
          }
        })()}
        <FormGroup row>
          <Label for="notes" sm={2}>Note</Label>
          <Col sm={10}>
            <Input type="textarea" placeholder="Notes" value={this.state.notes} rows={5} onChange={event => this.onChange({notes: event.target.value})}/>
          </Col>
        </FormGroup>
        <FormGroup row>
          <ButtonGroup className="col-sm-3 offset-sm-9">
            {SessionStore.isAdmin &&
            <Button color="danger" type="submit" onClick={this.onDelete}>Delete</Button>}
            {SessionStore.isApproved &&
            <Button color="primary" type="submit" disabled={Object.keys(this.state.error).length > 0} onClick={this.onSave}>Save</Button>}
          </ButtonGroup>
        </FormGroup>
      </Form>
    )
  }

}

export default ResultForm
