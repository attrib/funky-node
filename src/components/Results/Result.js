import React, { Component } from 'react'
import { withFirebase } from '../Firebase'
import AuthUserContext from '../Session/context'
import { Button, Col, Container, Row } from 'reactstrap'
import * as ROUTES from '../../constants/routes'
import { withRouter } from 'react-router-dom'
import ResultForm from './ResultForm'
import { compose } from 'recompose'
import Score from './Score'
import GameLink from '../Games/GameLink'
import { FormattedDateTime } from '../Utils/FormattedDate'

class Result extends Component {

  constructor (props) {
    super(props)

    let result = null, edit = false
    if (props.match.params.id === 'new') {
      result = {
        authorID: null,
        id: false,
        date: this.props.firebase.getCurrentDate(),
        gameID: null,
        image: null,
        location: null,
        notes: "",
        playerIDs: [],
        scores: [],
      }
      edit = true
      if (props.location.state && props.location.state.game) {
        result.game = props.location.state.game
        result.gameID = props.location.state.game.id
      }
    }
    if (props.location.state && props.location.state.result) {
      result = props.location.state.result
      result.date = Object.assign(this.props.firebase.Timestamp.now(), result.date)
    }
    this.state = {
      loading: false,
      edit: edit,
      result: result,
    }
  }

  componentDidMount () {
    if (this.state.result) {
      return
    }
    this.setState({loading: true})
    this.props.firebase.result(this.props.match.params.id)
      .get()
      .then((snapshot) => {
        let results = []
        results.push({
          ...snapshot.data(),
          id: snapshot.id
        })
        return this.props.firebase.resultsResolvePlayers(results)
      })
      .then((results) => {
        this.setState({
          loading: false,
          result: results[0]
        })
      })
  }

  onEditToggle = () => {
    this.setState({
      edit: !this.state.edit
    })
  }

  onSave = (result) => {
    if (result.isNew) {
      this.props.history.push(`${ROUTES.RESULTS}/${result.id}`)
    }
    this.setState({
      result,
      edit: false,
    })
  }

  onDelete = (game_id) => {
    this.props.history.push(ROUTES.RESULTS)
  }

  render() {
    const { result, loading, edit } = this.state
    if (loading || !result) return (<div><Container>Loading ...</Container></div>)
    return (
      <AuthUserContext.Consumer>
        {authUser => (
          <div>
            <Container>
              <h1>Result</h1>
              { !edit && (<>
                <Row>
                  <Col sm={2}>Date</Col>
                  <Col>
                    <FormattedDateTime date={result.date} />
                  </Col>
                </Row>
                <Row>
                  <Col sm={2}>Game</Col>
                  <Col><GameLink game={result.game}/></Col>
                </Row>
                <Row>
                  <Col sm={2}>Winner</Col>
                  <Col><Score winners result={result} funkies={true} /></Col>
                </Row>
                <Row>
                  <Col sm={2}>Score</Col>
                  <Col><Score losers result={result} funkies={true}/></Col>
                </Row>
                <Row>
                  <Col sm={2}>Notes</Col>
                  <Col>{result.notes}</Col>
                </Row>
                {result.image && <Row>
                  <Col sm={2}>Image</Col>
                  <Col>{result.image}</Col>
                </Row>}
                {result.location && <Row>
                  <Col sm={2}>Location</Col>
                  <Col>{result.location}</Col>
                </Row>}
                <Row>
                  <Col sm={{size: 3, offset: 9}}>
                    {authUser && authUser.uid === result.authorID && <Button onClick={this.onEditToggle}>Edit</Button>}
                  </Col>
                </Row>
              </>)}
              { edit && <ResultForm user={authUser} result={result} onSave={this.onSave} onDelete={this.onDelete} />}
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
)(Result)