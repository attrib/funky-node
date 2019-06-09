import React, { Component } from 'react'
import { withFirebase } from '../Firebase'
import AuthUserContext from '../Session/context'
import { Button, Col, Container, Row } from 'reactstrap'
import { Score, Winner } from './RecentResults'
import * as ROUTES from '../../constants/routes'
import { Link } from 'react-router-dom'
import ResultForm from './ResultForm'

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

  render() {
    const { result, loading, edit } = this.state
    if (loading || !result) return (<div><Container>Loading ...</Container></div>)
    return (
      <AuthUserContext.Consumer>
        {authUser => (
          <div>
            <Container>
              <h1>Result</h1>
              <Row>
                <Col sm={2}>Date</Col>
                <Col>
                  { new Intl.DateTimeFormat('de-DE', {
                    year: 'numeric',
                    month: 'long',
                    day: '2-digit',
                    hour: 'numeric',
                    minute: 'numeric'
                  }).format(result.date.toDate()) }
                </Col>
              </Row>
              <Row>
                <Col sm={2}>Game</Col>
                <Col><Link to={`${ROUTES.GAMES}/${result.gameID}`}>{result.game.name}</Link></Col>
              </Row>
              <Row>
                <Col sm={2}>Winner</Col>
                <Col><Winner result={result}/></Col>
              </Row>
              <Row>
                <Col sm={2}>Score</Col>
                <Col><Score result={result}/></Col>
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
              {!edit &&
              <Row>
                <Col sm={{size: 3, offset: 9}}>
                  {authUser && authUser.uid === result.authorID && <Button onClick={this.onEditToggle}>Edit</Button>}
                </Col>
              </Row>}
              { edit && <ResultForm user={authUser} result={result}/>}
            </Container>
          </div>
        )}
      </AuthUserContext.Consumer>
    )
  }

}

export default withFirebase(Result)