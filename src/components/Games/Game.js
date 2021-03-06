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
import ResultStore from "../../stores/ResultStore";
import RankingStore from "../../stores/RankingStore";

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
      recentResults: [],
      recentResultsSeasonPrefix: null,
      scores: [],
      ranking: null,
      rankingSeasonPrefix: null,
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
    ResultStore.getRecentResults({game: gameID})
    RankingStore.getRanking({game: gameID})
    // this.updateRecentResults()

    // this.updateRankings()
  }

  componentDidUpdate (prevProps, prevState, snapshot) {
    // this.updateRecentResults()
    // this.updateRankings()
  }

  updateRecentResults = () => {
    if (this.state.recentResultsSeasonPrefix === this.props.seasonPrefix) {
      return
    }

    const gameID = this.props.match.params.id

    ResultStore.getRecentResults({game: gameID})
    // this.props.firebase
    //   .resultsByGameId(gameID, this.props.selectedSeason)
    //   .then(snapshot => {
    //     let results = []
    //     snapshot.forEach(document => {
    //       let data = document.data();
    //       results.push({
    //         ...data,
    //         id: document.id,
    //       })
    //     })
    //     return this.props.firebase.resultsResolvePlayers(results)
    //   })
    //   .then((results) => {
    //     this.setState({
    //       recentResults: results,
    //       recentResultsSeasonPrefix: this.props.seasonPrefix,
    //     })
    //   })
  }

  updateRankings = () => {
    if (this.state.loading || this.state.rankingSeasonPrefix === this.props.seasonPrefix) {
      return
    }

    const gameID = this.props.match.params.id

    this.props.firebase.ranking(gameID, this.props.seasonPrefix)
      .then(ranking => {
        let promises = []
        ranking.players.forEach((player) => {
          promises.push(this.props.firebase.stats(player.id, this.props.seasonPrefix))
        })
        return Promise.all(promises)
          .then((stats) => {
            ranking.players = ranking.players.map((player) => {
              stats.forEach((stat) => {
                if (stat.id === player.id) {
                  player.stats = stat.games[gameID]
                  player.funkyDiff = stat.games[gameID].sum - stat.games[gameID].played + 1
                  player.won = stat.games[gameID].won
                  player.played = stat.games[gameID].played
                  player.wonPercentage = stat.games[gameID].won / stat.games[gameID].played * 100
                }
              })
              return player
            })
            return ranking
          })
      })
      .then((ranking) => {
        ranking.loadedSeasonPrefix = this.props.seasonPrefix
        this.setState({
          ranking,
          loading: false,
          rankingSeasonPrefix: this.props.seasonPrefix,
        })
      })
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
    const {game, loading, edit, error, recentResults, ranking} = this.state
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
                        { RankingStore.data && <RankingTable ranking={RankingStore.data} />}
                      </Col>
                      <Col>
                        <h2>Recent Results</h2>
                        { ResultStore.data && <RecentResults results={ResultStore.data} />}
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