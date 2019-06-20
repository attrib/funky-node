import React, { Component } from 'react'
import { Col, Container, Jumbotron, Row, Table } from 'reactstrap'
import { withFirebase } from '../Firebase'
import RecentResults from '../Results/RecentResults'
import Funkies from '../Results/Funkies'
import { GiTwoCoins } from 'react-icons/gi'
import * as ROUTES from '../../constants/routes'
import { Link } from 'react-router-dom'

class Player extends Component {

  constructor (props) {
    super(props)

    this.state = {
      loading: false,
      player: null,
      recentResults: null,
      playerRankings: null,
      stats: null,
    }

    if (props.location.state && props.location.state.player) {
      this.state.player = props.location.state.player
    }
  }

  componentDidMount () {
    const playerID = this.props.match.params.id
    if (!this.state.player) {
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

    if (!this.state.recentResults) {
      this.props.firebase.resultsByPlayerId(playerID)
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

    if (!this.state.stats) {
      this.props.firebase.stats(playerID)
        .then((stats) => {
          this.setState({
            stats: stats
          })
          let promises = []
          Object.keys(stats.games).forEach((gameID) => {
            promises.push(this.props.firebase.rankingWithGame(gameID))
          })
          promises.push(this.props.firebase.rankingWithGame('all'))
          return Promise.all(promises)
        })
        .then((rankings) => {
          let playerRankings = []
          const stats = this.state.stats
          rankings.forEach((ranking) => {
            ranking.players.forEach((player, i) => {
              if (player.id === playerID) {
                playerRankings.push({
                  rank: i+1,
                  game: ranking.game ? ranking.game : ranking.id,
                  funkies: player.funkies,
                  won: stats.games[ranking.id] ? stats.games[ranking.id].won : stats.won,
                  played: stats.games[ranking.id] ? stats.games[ranking.id].played : stats.played,
                  funkyDiff: stats.games[ranking.id] ? stats.games[ranking.id].sum - stats.games[ranking.id].played  + 1 : stats.sum - stats.played,
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
        <Jumbotron>
          <Container>
            <Row>
              <Col><h1>{player.nick}</h1></Col>
            </Row>
            { stats && (
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
                  <Col>{stats.won} ({(stats.won/stats.played*100).toFixed(0)}%)</Col>
                </Row>
              </>
            )}
          </Container>
        </Jumbotron>
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
                      <tr key={ranking.game.id} style={ranking.game === 'all' ? styleOverall : null}>
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

export default withFirebase(Player)