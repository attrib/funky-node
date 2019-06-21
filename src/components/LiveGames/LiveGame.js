import React, { Component } from 'react'
import { withFirebase } from '../Firebase'
import * as ROUTES from '../../constants/routes'
import { compose } from 'recompose'
import { withRouter } from 'react-router-dom'
import { Button, Col, Container, Row } from 'reactstrap'
import AuthUserContext from '../Session/context'
import { FormattedDateTime } from '../Utils/FormattedDate'
import GameLink from '../Games/GameLink'
import Score from '../Results/Score'
import LiveGameForm from './LiveGameForm'

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
      liveGame.date = Object.assign(this.props.firebase.Timestamp.now(), liveGame.date)
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
    this.props.firebase.liveGame(this.props.match.params.id)
      .onSnapshot((snapshot) => {
        if (snapshot.exists) {
          let livegame = []
          livegame.push({
            ...snapshot.data(),
            id: snapshot.id
          })
          return this.props.firebase.resultsResolvePlayers(livegame)
            .then((liveGame) => {
              console.log('update', liveGame[0])
              this.setState({
                loading: false,
                liveGame: liveGame[0]
              })
            })
        }
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
    if (loading || !liveGame) return (<div><Container>Loading ...</Container></div>)
    return (
      <AuthUserContext.Consumer>
        {authUser => (
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
                <Row>
                  <Col sm={2}>Notes</Col>
                  <Col>{liveGame.notes}</Col>
                </Row>
                <Row>
                  <Col sm={{size: 3, offset: 9}}>
                    {(authUser && (authUser.uid === liveGame.authorID || authUser.playerIDs.filter((id) => liveGame.playerIDs.indexOf(id) !== -1))) && <Button onClick={this.onEditToggle}>Edit</Button>}
                  </Col>
                </Row>
              </>)}
              { edit && <LiveGameForm user={authUser} liveGame={liveGame} onSave={this.onSave} onDelete={this.onDelete} onPublish={this.onPublish}/>}
            </Container>
          </div>
        )}
      </AuthUserContext.Consumer>
    )
  }

}

export default compose(
  withFirebase,
  withRouter,
)(LiveGame)