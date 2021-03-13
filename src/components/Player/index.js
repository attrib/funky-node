import React, { Component } from 'react'
import { Col, Container, Jumbotron, Row, Table } from 'reactstrap'
import RecentResults from '../Results/RecentResults'
import Funkies from '../Results/Funkies'
import { GiTwoCoins } from 'react-icons/gi'
import BackendService from "../../services/BackendService";
import RankingTable from "../Ranking/RankingTable";
import {reaction} from "mobx";
import SeasonStore from "../../stores/SeasonStore";

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
    this.playerService = new BackendService('player')
    this.rankingService = new BackendService('ranking')
  }

  componentDidMount () {
    this.updatePlayer(this.props)
    reaction(
      () => SeasonStore.selectedSeason,
      () => {
        this.updateStats()
      })
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
      this.playerService.getId(playerID)
        .then((player) => {
          this.setState({
            loading: false,
            player
          })
        })
        .catch((err) => {
          console.log(err)
        })
      this.updateStats()
    }
  }

  updateStats () {
    this.rankingService.get({player: this.state.player.id, tag: SeasonStore.selectedSeason.id})
      .then((stats) => {
        this.setState({
          stats: stats.pop()
        })
      })
      .catch((err) => {
        console.log(err)
      })
  }

  render () {
    const { player, loading, stats } = this.state
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
                  <Col>{stats.funkies.toFixed(4)} <GiTwoCoins style={{color: 'yellowgreen'}}/></Col>
                </Row>
                <Row>
                  <Col>Credit:</Col>
                  <Col><Funkies funkies={stats.funkyDiff}/></Col>
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
                <RankingTable filter={{player: player.id, by: 'game'}}/>
              </Col>
              <Col>
                <h2>Recent Results</h2>
                <RecentResults showGames filter={{player: player.id}} />
              </Col>
            </Row>
          }
        </Container>
      </div>
    )
  }

}

export default Player