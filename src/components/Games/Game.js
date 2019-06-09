import React, { Component } from 'react'
import { Alert, Button, ButtonGroup, Col, Container, Form, FormGroup, Input, Row } from 'reactstrap'
import MarkdownIt from 'markdown-it'
import AuthUserContext from '../Session/context'
import { withFirebase } from '../Firebase'
import * as ROUTES from '../../constants/routes'
import * as ROLES from '../../constants/roles'
import { withRouter } from 'react-router-dom'
import { compose } from 'recompose'
import RecentResults from './RecentResults'

const md = new MarkdownIt()

class Game extends Component {

  constructor (props) {
    super(props)

    let game = null, edit = false
    if (props.match.params.id === 'new') {
      game = {
        id: false,
        name: '',
        description: '',
        description_markdown: '',
        image: null,
      }
      edit = true
    }

    this.state = {
      loading: false,
      edit: edit,
      game: game,
      error: null,
      recentResults: [],
      scores: [],
    }
  }

  componentDidMount () {
    if (this.state.game) {
      return
    }
    this.setState({loading: true})
    this.props.firebase
      .game(this.props.match.params.id)
      .get()
      .then(doc => {
        this.setState({
          game: {
            id: doc.id,
            ...doc.data(),
          },
          loading: false,
        })
      })
    this.props.firebase
      .resultsByGameId(this.props.match.params.id)
      .then(snapshot => {
        let results = []
        snapshot.forEach(document => {
          let data = document.data();
          results.push({
            ...data,
            id: document.id,
          })
        })
        return this.props.firebase.resultsResolvePlayers(results)
      })
      .then((results) => {
        this.setState({
          recentResults: results,
        })
      })
  }

  onChange = (event) => {
    let game = this.state.game
    game[event.target.name] = event.target.value
    this.setState({game})
  }

  onEditToggle = () => {
    this.setState({
      edit: !this.state.edit
    })
  }

  onDelete = () => {
    this.props.firebase.game(this.state.game.id).delete()
      .then(() => this.props.history.push(`${ROUTES.GAMES}`))
      .catch((error) => this.setState({error: error.message}))
  }

  onSave = (authUser) => {
    const game = this.state.game
    const id = game.id
    if (id) {
      this.props.firebase.game(id).set({
        ...game,
        description: md.render(game.description_markdown),
      }, {merge: true})
        .then(() => this.successSave(authUser))
        .catch((error) => this.setState({error: error.message}))
    } else {
      delete game.id
      this.props.firebase.gameAdd({
        ...game,
        authorID: authUser.uid,
        description: md.render(game.description_markdown),
      })
        .then((game) => {this.props.history.push(`${ROUTES.GAMES}/${game.id}`); this.successSave(authUser, game.id); })
        .catch((error) => this.setState({error: error.message}))
    }
  }

  successSave = (authUser, id) => {
    const game = this.state.game
    if (id) {
      game.id = id
    }
    game.authorID = authUser.uid
    game.description = md.render(game.description_markdown)
    this.setState({
      edit: false,
      game: game
    })
  }

  render () {
    const {game, loading, edit, error, recentResults} = this.state
    return (
      <AuthUserContext.Consumer>
        {authUser => (
          <div>
            <Container>
              {loading && <div>Loading ...</div>}
              {game && (
                <>
                  <h1>{game.name}</h1>
                  {game.image && <img src={game.image} alt={game.name}/>}
                  {!edit && (
                    <>
                      <p dangerouslySetInnerHTML={{__html: game.description}}/>
                      <ButtonGroup>
                        {authUser && authUser.roles[ROLES.APPROVED] && <Button onClick={this.onEditToggle}>Add Result</Button>}
                        {authUser && authUser.uid === game.authorID && <Button onClick={this.onEditToggle}>Edit</Button>}
                      </ButtonGroup>
                    </>
                  )}
                  {edit && <p dangerouslySetInnerHTML={{__html: md.render(game.description_markdown)}}/>}
                  {edit && (
                    <Form onSubmit={(event) => event.preventDefault()}>
                      <FormGroup>
                        <Input type="text" value={game.name} onChange={this.onChange} name="name" placeholder="Name"/>
                      </FormGroup>
                      <FormGroup>
                        <Input type="textarea" value={game.description_markdown} onChange={this.onChange}
                               name="description_markdown"
                               placeholder="description"/>
                      </FormGroup>
                      {error && <Alert color="danger">{error}</Alert>}
                      <FormGroup>
                        {authUser && game.id && authUser.uid === game.authorID &&
                        <Button color="danger" type="submit" onClick={this.onDelete}>Delete</Button>}
                        {authUser &&
                        <Button color="primary" type="submit" onClick={() => this.onSave(authUser)}>Save</Button>}
                      </FormGroup>
                    </Form>
                  )}
                  {game.id && (
                    <Row>
                      <Col>
                        <h2>Ranking</h2>
                      </Col>
                      <Col>
                        <h2>Recent Results</h2>
                        { recentResults && <RecentResults results={recentResults} />}
                      </Col>
                    </Row>
                  )}
                </>
              )}
            </Container>
          </div>
        )}
      </AuthUserContext.Consumer>
    )
  }

}

export default compose(
  withFirebase,
  withRouter
)(Game)