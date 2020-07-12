import React, { Component } from 'react'
import { Col, Container, Jumbotron, Row, Table } from 'reactstrap'
import { withFirebase } from '../Firebase'
import RecentResults from '../Results/RecentResults'
import Funkies from '../Results/Funkies'
import { GiTwoCoins } from 'react-icons/gi'
import * as ROUTES from '../../constants/routes'
import { Link } from 'react-router-dom'
import withSeason from '../Season/withSeason'

class Player extends Component {

  constructor (props) {
    super(props)

    this.state = {
      loading: false,
      player: null,
      recentResults: null,
      recentResultsSeasonPrefix: null,
      playerRankings: null,
      stats: null,
      rankingSeasonPrefix: null,
    }

    if (props.location.state && props.location.state.player) {
      this.state.player = props.location.state.player
    }
  }

  componentDidMount () {
    this.updatePlayer(this.props)
  }

  componentDidUpdate (prevProps, prevState, snapshot) {
    if (prevProps !== this.props) {
      this.updatePlayer(this.props)
    }
  }

  updatePlayer = (props) => {
    const playerID = props.match.params.id
    const idChanged = !this.state.player || this.state.player.id !== playerID
    if (!this.state.player || idChanged) {
      this.setState({loading: true})
      this.props.firebase.player(playerID).get()
        .then((playerSnapshot) => {
          this.setState({
            loading: false,
            player: {
              ...playerSnapshot.data(),
              id: playerID,
            }
          })
        })
    }

    if (!this.state.recentResults || idChanged || this.state.recentResultsSeasonPrefix !== this.props.seasonPrefix) {
      this.props.firebase.resultsByPlayerId(playerID, this.props.selectedSeason)
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
            recentResultsSeasonPrefix: props.seasonPrefix,
          })
        })
    }

    if (!this.state.stats || idChanged || this.state.rankingSeasonPrefix !== this.props.seasonPrefix) {
      this.props.firebase.stats(playerID, this.props.seasonPrefix)
        .then((stats) => {
          this.setState({
            stats: stats,
            rankingSeasonPrefix: props.seasonPrefix,
          })
          let promises = []
          Object.keys(stats.games).forEach((gameID) => {
            promises.push(this.props.firebase.rankingWithGame(gameID, this.props.seasonPrefix))
          })
          promises.push(this.props.firebase.rankingWithGame('all', this.props.seasonPrefix))
          return Promise.all(promises)
        })
        .then((rankings) => {
          let playerRankings = []
          const stats = this.state.stats
          rankings.forEach((ranking) => {
            ranking.players.forEach((player, i) => {
              if (player.id === playerID) {
                playerRankings.push({
                  id: ranking.id,
                  rank: i+1,
                  game: ranking.game ? ranking.game : ranking.id,
                  funkies: player.funkies,
                  won: stats.games[ranking.id] ? stats.games[ranking.id].won : stats.won,
                  played: stats.games[ranking.id] ? stats.games[ranking.id].played : stats.played,
                  funkyDiff: stats.games[ranking.id] ? stats.games[ranking.id].sum - stats.games[ranking.id].played  + 1 : stats.sum - stats.played + 1,
                  wonPercentage: stats.games[ranking.id] ? stats.games[ranking.id].won / stats.games[ranking.id].played  * 100 : stats.won / stats.played * 100,
                })
              }
            })
          })
          playerRankings.sort((a, b) => {
            if (a.funkies > b.funkies) return -1
            if (a.funkies < b.funkies) return 1
            return 0
          })
          playerRankings.loadedSeasonPrefix = this.props.seasonPrefix
          this.setState({playerRankings})
        })
    }

  }

  render () {
    const { player, loading, recentResults, playerRankings, stats } = this.state
    const styleOverall = {
      backgroundColor: '#DDD'
    }
    return (
      <div>
        {(player) &&
        <Jumbotron>
          <Container>
            <Row>
              <Col><h1>{player.nick}</h1></Col>
            </Row>
            {stats && (
              <>
                <Row>
                  <Col>Avg:</Col>
                  <Col>{stats.avg.toFixed(4)} <GiTwoCoins style={{color: 'yellowgreen'}}/></Col>
                </Row>
                <Row>
                  <Col>Credit:</Col>
                  <Col><Funkies funkies={stats.sum - stats.played + 1}/></Col>
                </Row>
                <Row>
                  <Col>Games played:</Col>
                  <Col>{stats.played}</Col>
                </Row>
                <Row>
                  <Col>Games won:</Col>
                  <Col>{stats.won} ({(stats.won / stats.played * 100).toFixed(0)}%)</Col>
                </Row>
              </>
            )}
          </Container>
        </Jumbotron>
        }
        <Container>
          { loading && <div>Loading...</div> }
          {(!loading && player) &&
            <Row>
              <Col>
                <h2>Ranking</h2>
                { playerRankings && (
                  <Table>
                    <thead>
                    <tr>
                      <th>#</th>
                      <th>Game</th>
                      <th>Avg</th>
                      <th>Credit</th>
                      <th>Won</th>
                    </tr>
                    </thead>
                    <tbody>
                    {playerRankings.map((ranking) => (
                      <tr key={`ranking-${ranking.id}`} style={ranking.game === 'all' ? styleOverall : null}>
                        <td>{ranking.rank}</td>
                        <td>
                          { ranking.game !== 'all' && <Link to={`${ROUTES.GAMES}/${ranking.id}`}>{ranking.game.name}</Link>}
                          { ranking.game === 'all' && 'Overall' }
                        </td>
                        <td>{ranking.funkies.toFixed(2)} <GiTwoCoins style={{color: 'yellowgreen'}}/></td>
                        <td><Funkies funkies={ranking.funkyDiff}/></td>
                        <td>{ranking.won} / {ranking.played} ({ranking.wonPercentage.toFixed(0)}%)</td>
                      </tr>
                    ))}
                    </tbody>
                  </Table>
                )}
              </Col>
              <Col>
                <h2>Recent Results</h2>
                { recentResults && <RecentResults showGames results={recentResults} />}
              </Col>
            </Row>
          }
        </Container>
      </div>
    )
  }

}

export default withFirebase(withSeason(Player))