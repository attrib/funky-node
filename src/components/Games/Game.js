import React, { Component } from 'react'
import { Alert, Button, ButtonGroup, Col, Container, Form, FormGroup, Input, Label, Row } from 'reactstrap'
import MarkdownIt from 'markdown-it'
import * as ROUTES from '../../constants/routes'
import { withRouter } from 'react-router-dom'
import RecentResults from '../Results/RecentResults'
import { SelectList } from 'react-widgets'
import { observer } from "mobx-react";
import SessionStore from "../../stores/SessionStore";
import BackendService from "../../services/BackendService";
import TabbedRankingTable from "../Ranking/TabbedRankingTable";
import {liveGameWidgets} from "../LiveGames/Widgets";

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
        score_widget: 'ScoreTeamForm'
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

  onChangePlayerCount = (event) => {
    let game = this.state.game
    game.playerCount[event.target.name] = event.target.value
    this.setState({game})
  }

  onChangeScoreWidget = (widget) => {
    let game = this.state.game
    game.score_widget = widget.id
    this.setState({game})
  }

  onChangeLiveWidget = (widget) => {
    let game = this.state.game
    game.livegame_widget = widget.id
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
    if (game && !game.playerCount) {
      game.playerCount = {}
    }
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
                    <SelectList data={scoreWidgetForms} textField="label" valueField="id" value={game.score_widget} onChange={this.onChangeScoreWidget}/>
                  </FormGroup>
                  <FormGroup>
                    <Label>Widget for live game</Label>
                    <SelectList data={Object.keys(liveGameWidgets).map((i) => {return  {id:i, label:i}})} textField="label" valueField="id" value={game.livegame_widget} onChange={this.onChangeLiveWidget}/>
                  </FormGroup>
                  <FormGroup row>
                    <Col md={6}>
                      <Row>
                        <Label md={4}>Min Teams</Label>
                        <Col md={8}>
                          <Input type="number" value={game.playerCount.teamMin} onChange={this.onChangePlayerCount} name="teamMin" placeholder="Min Teams" />
                        </Col>
                      </Row>
                    </Col>
                    <Col md={6}>
                      <Row>
                        <Label md={4}>Max Teams</Label>
                        <Col md={8}>
                          <Input type="number" value={game.playerCount.teamMax} onChange={this.onChangePlayerCount} name="teamMax" placeholder="Max Teams" />
                        </Col>
                      </Row>
                    </Col>
                    <Col md={6}>
                      <Row>
                        <Label md={4}>Min Players per Team</Label>
                        <Col md={8}>
                          <Input type="number" value={game.playerCount.perTeamMin} onChange={this.onChangePlayerCount} name="perTeamMin" placeholder="Min Player per Team" />
                        </Col>
                      </Row>
                    </Col>
                    <Col md={6}>
                      <Row>
                        <Label md={4}>Max Players per Team</Label>
                        <Col md={8}>
                          <Input type="number" value={game.playerCount.perTeamMax} onChange={this.onChangePlayerCount} name="perTeamMax" placeholder="Max Player per Team" />
                        </Col>
                      </Row>
                    </Col>
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
                    <TabbedRankingTable filter={{game: game.id}}/>
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

export default observer(withRouter(Game))