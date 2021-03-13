import React, { Component } from 'react'
import { Alert, Button, ButtonGroup, Col, Container, Form, FormGroup, Input, Label, Row } from 'reactstrap'
import MarkdownIt from 'markdown-it'
import * as ROUTES from '../../constants/routes'
import { withRouter } from 'react-router-dom'
import { compose } from 'recompose'
import RecentResults from '../Results/RecentResults'
import { SelectList } from 'react-widgets'
import RankingTable from '../Ranking/RankingTable'
import { observer } from "mobx-react";
import SessionStore from "../../stores/SessionStore";
import BackendService from "../../services/BackendService";

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
    this.gameService = new BackendService('game')
  }

  componentDidMount () {
    if (this.state.game) {
      return
    }
    const gameID = this.props.match.params.id

    this.setState({loading: true})
    this.gameService.getId(gameID)
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
    this.gameService.delete(this.state.game.id)
      .then(() => this.props.history.push(`${ROUTES.GAMES}`))
      .catch((error) => this.setState({error: error.message}))
  }

  onSave = () => {
    const game = this.state.game
    if (game.id) {
      this.gameService.patch(game.id, game)
        .then((game) => this.successSave(game))
        .catch((error) => this.setState({error: error.message}))
    } else {
      this.gameService.post(game)
        .then((game) => {this.props.history.push(`${ROUTES.GAMES}/${game.id}`); this.successSave(game); })
        .catch((error) => this.setState({error: error.message}))
    }
  }

  onAddResult = () => {
    this.props.history.push(`${ROUTES.RESULTS}/new`, {
      game: this.state.game,
    })
  }

  successSave = (game) => {
    this.setState({
      edit: false,
      error: null,
      game: game
    })
  }

  render () {
    const {game, loading, edit, error} = this.state
    return (
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
                    {SessionStore.isApproved && <Button onClick={this.onAddResult}>Add Result</Button>}
                    {(SessionStore.isAdmin) && <Button onClick={this.onEditToggle}>Edit</Button>}
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
                    {SessionStore.isAdmin &&
                    <Button color="danger" type="submit" onClick={this.onDelete}>Delete</Button>}
                    {SessionStore.isAdmin &&
                    <Button color="primary" type="submit" onClick={() => this.onSave()}>Save</Button>}
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
    )
  }

}

export default observer(compose(
  withRouter,
)(Game))