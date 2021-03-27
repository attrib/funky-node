import React, {Component} from 'react'
import * as ROUTES from '../../constants/routes'
import { withRouter } from 'react-router-dom'
import { Button, Col, Container, Row } from 'reactstrap'
import { FormattedDateTime } from '../Utils/FormattedDate'
import GameLink from '../Games/GameLink'
import Score from '../Results/Score'
import LiveGameForm from './LiveGameForm'
import SessionStore from "../../stores/SessionStore";
import LiveGamesStore from "../../stores/LiveGamesStore";
import {observer} from "mobx-react";
import {reaction} from "mobx";
import LiveScoreDisplay from "./LiveScoreDisplay";

class LiveGame extends Component{

  constructor (props) {
    super(props)

    let liveGame = null, edit = false
    if (props.match.params.id === 'new') {
      liveGame = {}
      edit = true
      if (props.location.state && props.location.state.game) {
        liveGame.game = props.location.state.game
        liveGame.gameID = props.location.state.game.id
      }
    }

    if (props.location.state && props.location.state.result) {
      liveGame = props.location.state.result
    }

    this.state = {
      loading: false,
      edit,
      liveGame,
    }
  }

  componentDidMount () {
    if (this.state.liveGame) {
      return
    }
    this.setState({loading: true})
    LiveGamesStore.getLiveGame(this.props.match.params.id)
      .then((liveGame) => {
        this.liveGame = liveGame
        this.setState({liveGame, loading: false})
      })
      .catch(() => {
        this.setState({loading: false})
        this.props.history.push(ROUTES.LIVE_GAMES)
      })
    reaction(
      () => LiveGamesStore.liveGames[this.props.match.params.id],
      (liveGame) => {
        this.setState({liveGame})
      })
  }

  onEditToggle = () => {
    this.setState({
      edit: !this.state.edit
    })
  }

  onSave = (liveGame) => {
    if (liveGame.isNew) {
      this.props.history.push(ROUTES.LIVE_GAME.replace(':id', liveGame.id))
      delete liveGame.isNew
    }
    this.setState({
      liveGame,
      edit: true,
    })
  }

  onDelete = (game_id) => {
    this.props.history.push(ROUTES.LIVE_GAMES)
  }

  onPublish = (result_id) => {
    this.props.history.push(ROUTES.RESULT.replace(':id', result_id))
  }

  render () {
    const { liveGame, loading, edit } = this.state
    const authUser = SessionStore.user
    if (loading || !liveGame) return (<div><Container>Loading ...</Container></div>)
    return (
      <div>
        <Container>
          <h1>Live Game</h1>
          { !edit && (<>
            <Row>
              <Col sm={2}>started</Col>
              <Col>
                <FormattedDateTime date={liveGame.date} />
              </Col>
            </Row>
            <Row>
              <Col sm={2}>last updated</Col>
              <Col>
                <FormattedDateTime date={liveGame.lastUpdatedDate} />
              </Col>
            </Row>
            <Row>
              <Col sm={2}>Game</Col>
              <Col><GameLink game={liveGame.game}/></Col>
            </Row>
            <Row>
              <Col sm={2}>Winner</Col>
              <Col><Score winners result={liveGame} funkies={true} /></Col>
            </Row>
            <Row>
              <Col sm={2}>Score</Col>
              <Col><Score losers result={liveGame} funkies={true}/></Col>
            </Row>
            {liveGame.notes && <Row>
              <Col sm={2}>Notes</Col>
              <Col>{liveGame.notes}</Col>
            </Row>}
            <Row className="mt-4">
              <LiveScoreDisplay result={{...liveGame, livescore_widget: 'SimpleTableForm'}} />
            </Row>
            <Row>
              <Col sm={{size: 3, offset: 9}}><Button onClick={this.onEditToggle}>Edit</Button></Col>
            </Row>
          </>)}
          { edit && <LiveGameForm user={authUser} liveGame={liveGame} onSave={this.onSave} onDelete={this.onDelete} onPublish={this.onPublish}/>}
        </Container>
      </div>
    )
  }

}

export default withRouter(observer(LiveGame))