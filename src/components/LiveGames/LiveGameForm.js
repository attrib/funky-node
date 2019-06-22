import React, { Component } from 'react'
import { Alert, Button, ButtonGroup, Col, Form, FormGroup, Input, Label, Row, Spinner } from 'reactstrap'
import { DateTimePicker, DropdownList } from 'react-widgets'
import { withFirebase } from '../Firebase'
import SimpleTableForm from './SimpleTableForm'
import GameLink from '../Games/GameLink'
import { FormattedDateTime } from '../Utils/FormattedDate'

class LiveGameForm extends Component {

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
      liveUpdate: false,
    }
    if (this.props.liveGame) {
      state = {
        ...state,
        ...this.props.liveGame,
      }
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
    let liveGame = {
      authorID: this.state.authorID ? this.state.authorID : this.props.user.uid,
      date: this.state.date,
      gameID: this.state.game.id,
      image: this.state.image,
      location: this.state.location,
      notes: this.state.notes,
      scores: this.state.scores,
    }
    let players = []
    liveGame.scores = liveGame.scores.filter((score) => !this.isScoreEmpty(score))
    liveGame.scores = liveGame.scores.map((score) => {
      score.score = Number(score.score)
      score.players = score.players.filter(player => player.nick !== '')
      score.players.forEach((player) => {
        players.push(this.props.firebase.playerByNameSnapshot(player.nick))
      })
      return score
    })

    return Promise.all(players)
      .then((playerSnapshots) => {
        let players = {}
        playerSnapshots.forEach((playerSnapshot) => {
          let data = playerSnapshot.data()
          players[data.nick] = playerSnapshot.ref
        })
        liveGame.scores = liveGame.scores.map((score) => {
          score.players = score.players.map((player) => players[player.nick])
          return score
        })
        // update
        if (this.state.id) {
          return this.props.firebase.liveGame(this.state.id)
            .set(liveGame)
            .then(() => {
              return {
                ...liveGame,
                id: this.state.id,
              }
            })
        }
        // create
        else {
          return this.props.firebase.liveGameAdd(liveGame)
            .then((ref) => ref.get())
            .then((snapshot) => {
              return {
                ...snapshot.data(),
                id: snapshot.id,
              }
            })
        }
      })
      .then((liveGame) => {
        if (this.props.onSave) {
          this.props.firebase.resultsResolvePlayers([liveGame])
            .then((liveGames) => {
              let liveGame = liveGames.pop()
              liveGame.isNew = !this.state.id
              this.setState({...liveGame})
              this.props.onSave(liveGame)
            })
        }
      })
  }

  onPublish = () => {
    this.onSave()
      .then(() => {
        return this.props.firebase.liveGame(this.state.id).get()
      })
      .then((liveGameSnapshot) => {
        return this.props.firebase.resultAdd(liveGameSnapshot.data())
      })
      .then((ref) => {
        this.props.onPublish(ref.id)
        return this.props.firebase.liveGame(this.state.id).delete()
      })
  }

  onDelete = () => {
    this.props.firebase.liveGame(this.state.id)
      .delete()
      .then(() => {
        if (this.props.onDelete) {
          this.props.onDelete(this.state.id)
        }
      })
  }

  scoreUpdate = () => {
    this.setState({liveUpdate: true})
    let promise = []
    // hack to clone
    let scores = JSON.parse(JSON.stringify(this.state.scores))
    this.state.scores.forEach((score, index) => {
      score.players.forEach((player) => {
        promise.push(this.props.firebase.playerByNameSnapshot(player.nick))
      })
    })
    Promise.all(promise)
      .then((playerSnapshots) => {
        let players = {}
        playerSnapshots.forEach((playerSnapshot) => {
          let data = playerSnapshot.data()
          players[data.nick] = playerSnapshot.ref
        })
        scores = scores.map((score) => {
          score.players = score.players.map((player) => players[player.nick])
          return score
        })
        this.props.firebase.liveGame(this.state.id)
          .set({scores, lastUpdatedDate: this.props.firebase.FieldValue.serverTimestamp(), notes: this.state.notes}, {merge: true})
          .then(() => {
            this.setState({liveUpdate: false})
          })
      })
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
              <Col><GameLink game={this.state.game}/></Col>
            </Row>
          </>
        )}
        {!this.state.id && (
          <>
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
          </>
        )}
        {this.state.game && (() => {
          switch(this.state.game.liveGameWidget) {
            case 'SimpleTable':
              return <SimpleTableForm scores={this.state.scores} error={this.state.error} playerList={this.state.playerList} filterSelectablePlayers={this.filterSelectablePlayers} isScoreEmpty={this.isScoreEmpty} onChange={this.onChange} options={this.state.game.liveGameWidgetOptions} isNew={!this.state.id} scoreUpdate={this.scoreUpdate}/>;
            default:
              if (this.state.game.scoreWidget === 'ScoreTeamForm') {
                return (
                  <>
                    <Alert color="warning">Missing live game widget for <GameLink game={this.state.game}/>, fallback selected.</Alert>
                    <SimpleTableForm scores={this.state.scores} error={this.state.error} playerList={this.state.playerList} filterSelectablePlayers={this.filterSelectablePlayers} isScoreEmpty={this.isScoreEmpty} onChange={this.onChange} options={this.state.game.liveGameWidgetOptions} isNew={!this.state.id} scoreUpdate={this.scoreUpdate}/>;
                  </>
                )
              }
              else {
                return <Alert color="danger">Missing live game widget for <GameLink game={this.state.game}/>, the score widget doesn't support live games.</Alert>;
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

export default withFirebase(LiveGameForm)