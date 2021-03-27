import React, { Component } from 'react'
import { Alert, Button, ButtonGroup, Col, Form, FormGroup, Input, Label, Row, Spinner } from 'reactstrap'
import { DateTimePicker, DropdownList } from 'react-widgets'
import SimpleTableForm from './SimpleTableForm'
import GameLink from '../Games/GameLink'
import { FormattedDateTime } from '../Utils/FormattedDate'
import BackendService from "../../services/BackendService"
import LiveGamesStore from "../../stores/LiveGamesStore";
import {observer} from "mobx-react";
import {reaction, toJS} from "mobx";

class LiveGameForm extends Component {

  constructor (props) {
    super(props)

    let state = {
      id: false,
      date: new Date(),
      image: null,
      location: null,
      notes: "",
      playerIDs: [],
      playerNames: [],
      scores: [],
      gameList: [],
      playerList: [],
      error: {},
      liveUpdate: false,
    }
    if (this.props.liveGame) {
      state = {
        ...state,
        ...this.props.liveGame,
      }
    }
    this.state = state
    this.playerService = new BackendService('player')
    this.gameService = new BackendService('game')
    this.resultService = new BackendService('result')
  }

  componentDidMount() {
    this.loadGames()
    this.loadPlayers()
    if (this.state.id) {
      reaction(
        () => LiveGamesStore.liveGames[this.state.id],
        (liveGame) => {
          this.setState({...liveGame})
        })
    }
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
    let liveGame = {
      id: this.state.id,
      date: this.state.date,
      game: this.state.game,
      image: this.state.image,
      location: this.state.location,
      notes: this.state.notes,
      scores: this.state.scores,
    }
    liveGame.scores = liveGame.scores.filter((score) => !this.isScoreEmpty(score))
    liveGame.scores = liveGame.scores.map((score) => {
      score.score = Number(score.score)
      score.players = score.players.filter(player => player.nick !== '')
      return score
    })

    const isNew = !liveGame.id
    LiveGamesStore
      .save(liveGame)
      .then((liveGame) => {
        if (liveGame.error) {
          console.log(liveGame.error)
        }
        else if (isNew) {
          console.log('saved is new')
          this.setState({...liveGame})
          this.props.onSave({...liveGame, isNew: true})
        }
      })
  }

  onPublish = () => {
    let result = {
      date: this.state.lastUpdatedDate,
      game: {name: this.state.game.name},
      image: this.state.image,
      location: this.state.location,
      notes: this.state.notes,
      scores: this.state.scores,
      tags: [{name: '' + (new Date(this.state.date)).getFullYear()}],
      livescore_widget: 'SimpleTableForm'
    }
    result.scores = result.scores.filter((score) => !this.isScoreEmpty(score))
    result.scores = result.scores.map((score) => {
      score.score = Number(score.score)
      score.players = score.players.filter(player => player.nick !== '')
      return score
    })

    this.resultService.post(result)
      .then((result) => {
        this.onDelete()
        result.isNew = !this.state.id
        this.props.onPublish(result.id)
      })
      .catch((error) => {
        console.log(error)
      })
  }

  onDelete = () => {
    LiveGamesStore.delete(this.state.id)
    if (this.props.onDelete) {
      this.props.onDelete(this.state.id)
    }
  }

  render() {
    return (
      <Form onSubmit={(event) => event.preventDefault()}>
        {this.state.id && (
          <>
            <Row>
              <Col sm={2}>Date</Col>
              <Col>
                <FormattedDateTime date={this.state.date} />
              </Col>
            </Row>
            <Row>
              <Col sm={2}>Game</Col>
              <Col><GameLink game={toJS(this.state.game)}/></Col>
            </Row>
          </>
        )}
        {!this.state.id && (
          <>
            <FormGroup row>
              <Label for="dateJS" sm={2}>Date</Label>
              <Col sm={10}>
                <DateTimePicker name="date" placeholder="Date" value={this.state.date} onChange={date => this.onChange({date})} />
              </Col>
            </FormGroup>
            <FormGroup row>
              <Label for="gamename" sm={2}>Game</Label>
              <Col sm={10}>
                <DropdownList value={this.state.game} name="gamename" data={this.state.gameList} busy={this.state.gameList === null} textField="name" placeholder="Game" onChange={this.onChangeGame} filter="startsWith" />
              </Col>
            </FormGroup>
          </>
        )}
        {this.state.game && (() => {
          switch(this.state.game.liveGameWidget) {
            case 'SimpleTable':
              return <SimpleTableForm scores={this.state.scores} error={this.state.error} playerList={this.state.playerList} filterSelectablePlayers={this.filterSelectablePlayers} isScoreEmpty={this.isScoreEmpty} onChange={this.onChange} options={this.state.game.liveGameWidgetOptions} isNew={!this.state.id} scoreUpdate={this.onSave}/>
            default:
              if (this.state.game.score_widget === 'ScoreTeamForm') {
                return (
                  <>
                    {/*<Alert color="warning">Missing live game widget for <GameLink game={this.state.game}/>, fallback selected.</Alert>*/}
                    <SimpleTableForm scores={this.state.scores} error={this.state.error} playerList={this.state.playerList} filterSelectablePlayers={this.filterSelectablePlayers} isScoreEmpty={this.isScoreEmpty} onChange={this.onChange} options={this.state.game.liveGameWidgetOptions} isNew={!this.state.id} scoreUpdate={this.onSave}/>
                  </>
                )
              }
              else {
                return <Alert color="danger">Missing live game widget for <GameLink game={this.state.game}/>, the score widget doesn't support live games.</Alert>
              }
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
            {this.state.liveUpdate && <Spinner color="success" />}
            {this.props.user && this.state.id && this.props.user.uid === this.state.authorID &&
            <Button color="danger" type="submit" onClick={this.onDelete}>Delete</Button>}
            {this.props.user &&
            <Button color="primary" type="submit" disabled={Object.keys(this.state.error).length > 0} onClick={this.onSave}>Save</Button>}
            {this.props.user && this.state.id &&
            <Button color="success" type="submit" disabled={Object.keys(this.state.error).length > 0} onClick={this.onPublish}>Publish</Button>}
          </ButtonGroup>
        </FormGroup>
      </Form>
    )
  }

}

export default observer(LiveGameForm)