import React, { Component } from 'react'
import { Alert, Button, ButtonGroup, Col, Container, Form, FormGroup, Input, Label, Row } from 'reactstrap'
import MarkdownIt from 'markdown-it'
import AuthUserContext from '../Session/context'
import { withFirebase } from '../Firebase'
import * as ROUTES from '../../constants/routes'
import * as ROLES from '../../constants/roles'
import { withRouter } from 'react-router-dom'
import { compose } from 'recompose'
import RecentResults from '../Results/RecentResults'
import { SelectList } from 'react-widgets'
import RankingTable from '../Ranking/RankingTable'
import { withSeason } from '../Season/withSeason'
import { observer } from "mobx-react";
import GameStore from "../../stores/GameStore";

const md = new MarkdownIt()
const scoreWidgetForms = [
  {
    id: 'ScoreTeamForm',
    label: 'Scores for team or players (Default)',
  },
  {
    id: 'ScoreRankingForm',
    label: 'Ranking of players',
  }
]

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
        scoreWidget: 'ScoreTeamForm'
      }
      edit = true
    }

    this.state = {
      loading: false,
      edit: edit,
      game: game,
      error: null,
      scores: [],
    }
  }

  componentDidMount () {
    if (this.state.game) {
      return
    }
    const gameID = this.props.match.params.id

    this.setState({loading: true})
    GameStore.getGame(gameID)
      .then(game => this.setState({game, loading: false}))
      .catch(error => this.setState({error: error, loading: false}))
  }

  onChange = (event) => {
    let game = this.state.game
    game[event.target.name] = event.target.value
    this.setState({game})
  }

  onChangeScoreWidget = (widget) => {
    let game = this.state.game
    game.scoreWidget = widget.id
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

  onAddResult = () => {
    this.props.history.push(`${ROUTES.RESULTS}/new`, {
      game: this.state.game,
    })
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
    const {game, loading, edit, error} = this.state
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
                        {authUser && authUser.roles[ROLES.APPROVED] && <Button onClick={this.onAddResult}>Add Result</Button>}
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
                      <FormGroup>
                        <Label>Widget for result form</Label>
                        <SelectList data={scoreWidgetForms} textField="label" valueField="id" value={game.scoreWidget} onChange={this.onChangeScoreWidget}/>
                      </FormGroup>
                      {error && <Alert color="danger">{error}</Alert>}
                      <ButtonGroup>
                        {authUser && game.id && authUser.uid === game.authorID &&
                        <Button color="danger" type="submit" onClick={this.onDelete}>Delete</Button>}
                        {authUser &&
                        <Button color="primary" type="submit" onClick={() => this.onSave(authUser)}>Save</Button>}
                      </ButtonGroup>
                    </Form>
                  )}
                  {game.id && (
                    <Row>
                      <Col>
                        <h2>Ranking</h2>
                        <RankingTable filter={{game: game.id}} />
                      </Col>
                      <Col>
                        <h2>Recent Results</h2>
                        <RecentResults filter={{game: game.id}} />
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

export default observer(compose(
  withFirebase,
  withRouter,
  withSeason
)(Game))