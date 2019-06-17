import React, { Component } from 'react'
import { withFirebase } from '../Firebase'
import { Alert, Button, ButtonGroup, Col, Form, FormGroup, Input, Label } from 'reactstrap'
import { DateTimePicker, DropdownList } from 'react-widgets'
import 'react-widgets/lib/scss/react-widgets.scss'
import ScoreTeamForm from './ScoreTeamForm'
import ScoreRankingForm from './ScoreRankingForm'
import { Link } from 'react-router-dom'
import * as ROUTES from '../../constants/routes'

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
      gameList: [],
      playerList: [],
      error: {},
    }
    if (this.props.result) {
      state = {
        ...state,
        ...this.props.result,
      }
      state.scores = state.scores.map((score) => {
        score.players.push({nick: ""})
        return score
      })
      state.scores.push({score: 0, players: [{nick: ""}]})
    }

    this.state = state
  }

  componentDidMount() {
    this.loadGames()
    this.loadPlayers()
  }

  loadGames = () => {
    if (this.state.gameList.length) {
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
    if (this.state.playerList.length) {
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
      authorID: this.state.authorID ? this.state.authorID : this.props.user.uid,
      date: this.state.date,
      gameID: this.state.game.id,
      image: this.state.image,
      location: this.state.location,
      notes: this.state.notes,
      scores: this.state.scores,
    }
    let players = []
    result.scores = result.scores.filter((score) => !this.isScoreEmpty(score))
    result.scores = result.scores.map((score) => {
      score.score = Number(score.score)
      score.players = score.players.filter(player => player.nick !== '')
      score.players.forEach((player) => {
        players.push(this.props.firebase.playerByNameSnapshot(player.nick))
      })
      return score
    })

    Promise.all(players)
      .then((playerSnapshots) => {
        let players = {}
        playerSnapshots.forEach((playerSnapshot) => {
          let data = playerSnapshot.data()
          players[data.nick] = playerSnapshot.ref
        })
        result.scores = result.scores.map((score) => {
          score.players = score.players.map((player) => players[player.nick])
          return score
        })
        // update
        if (this.state.id) {
          return this.props.firebase.result(this.state.id)
            .set(result)
            .then(() => {
              return {
                ...result,
                id: this.state.id,
              }
            })
        }
        // create
        else {
          return this.props.firebase.resultAdd(result)
            .then((ref) => ref.get())
            .then((snapshot) => {
              return {
                ...snapshot.data(),
                id: snapshot.id,
              }
            })
        }
      })
      .then((result) => {
        if (this.props.onSave) {
          this.props.firebase.resultsResolvePlayers([result])
            .then((results) => {
              let result = results.pop()
              result.isNew = !this.state.id
              this.props.onSave(result)
            })
        }
      })
  }

  onDelete = () => {
    this.props.firebase.result(this.state.id)
      .delete()
      .then(() => {
        if (this.props.onDelete) {
          this.props.onDelete(this.state.id)
        }
      })
  }

  render() {
    return (
      <Form onSubmit={(event) => event.preventDefault()}>
        <FormGroup row>
          <Label for="dateJS" sm={2}>Date</Label>
          <Col sm={10}>
            <DateTimePicker name="dateJS" placeholder="Date" value={this.state.date.toDate()} onChange={dateJS => this.onChange({date: this.props.firebase.Timestamp.fromDate(dateJS)})} />
          </Col>
        </FormGroup>
        <FormGroup row>
          <Label for="gamename" sm={2}>Game</Label>
          <Col sm={10}>
            <DropdownList value={this.state.game} name="gamename" data={this.state.gameList} busy={this.state.gameList === null} textField="name" placeholder="Game" onChange={this.onChangeGame} filter="startsWith" />
          </Col>
        </FormGroup>
        {(() => {
          switch(this.state.game.scoreWidget) {
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
            {this.props.user && this.state.id && this.props.user.uid === this.state.authorID &&
            <Button color="danger" type="submit" onClick={this.onDelete}>Delete</Button>}
            {this.props.user &&
            <Button color="primary" type="submit" disabled={Object.keys(this.state.error).length > 0} onClick={this.onSave}>Save</Button>}
          </ButtonGroup>
        </FormGroup>
      </Form>
    )
  }

}

export default withFirebase(ResultForm)
