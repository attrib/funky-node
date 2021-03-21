import React, {Component} from "react";
import BackendService from "../../services/BackendService";
import {Col, Container, Jumbotron, Row} from "reactstrap";
import {GiTwoCoins} from "react-icons/gi";
import Funkies from "../Results/Funkies";
import RankingTable from "../Ranking/RankingTable";
import RecentResults from "../Results/RecentResults";
import {reaction} from "mobx";
import SeasonStore from "../../stores/SeasonStore";

class Team extends Component {

  constructor(props) {
    super(props);

    this.state = {
      team: {
        players: []
      },
      stats: null,
      loading: false,
    }

    if (props.location.state && props.location.state.team) {
      this.state.team = props.location.state.team
    }

    this.teamService = new BackendService('team')
    this.rankingService = new BackendService('ranking')
  }

  componentDidMount () {
    this.updateTeam(this.props)
    reaction(
      () => SeasonStore.selectedSeason,
      () => {
        this.updateStats()
      })
  }

  updateTeam = (props) => {
    const teamID = props.match.params.id
    const idChanged = !this.state.team || this.state.team.id !== teamID
    if (!this.state.player || idChanged) {
      this.setState({loading: true})
      this.teamService.getId(teamID)
        .then((team) => {
          this.setState({
            loading: false,
            team
          })
        })
        .catch((err) => {
          console.log(err)
        })
      this.updateStats()
    }
  }

  updateStats () {
    if (SeasonStore.selectedSeason.id) {
      let filter = {team: this.state.team.id}
      if (SeasonStore.selectedSeason.id !== 'all') {
        filter.tag = SeasonStore.selectedSeason.id
      }
      this.rankingService.get(filter)
        .then((stats) => {
          this.setState({
            stats: stats.pop()
          })
        })
        .catch((err) => {
          console.log(err)
        })
    }
  }

  render() {
    const {team, stats, loading} = this.state
    return (
      <div>
        <Jumbotron>
          <Container>
            <Row>
              <Col><h1>{team.players.map((player) => player.nick).join(', ')}</h1></Col>
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
        <Container>
          { loading && <div>Loading...</div> }
          {(team && team.id) &&
          <Row>
            <Col>
              <h2>Ranking</h2>
              <RankingTable filter={{team: team.id, by: 'team_game'}}/>
            </Col>
            <Col>
              <h2>Recent Results</h2>
              <RecentResults showGames filter={{team: team.id}} />
            </Col>
          </Row>
          }
        </Container>
      </div>
    )
  }


}

export default Team