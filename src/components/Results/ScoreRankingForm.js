import React, { Component } from 'react'
import { Button, Col, FormGroup, Label, Row } from 'reactstrap'
import { Combobox } from 'react-widgets'

class ScoreRankingForm extends Component {

  constructor (props) {
    super(props)
    let ranking = {}
    props.scores.forEach((score) => {
      if (!('rank' in score)) {
        score.rank = 1
      }
      score.players = score.players.filter(player => player.nick !== '')
      if (score.rank in ranking) {
        ranking[score.rank].players = ranking[score.rank].players.concat(score.players)
      }
      else {
        ranking[score.rank] = score
      }
    })
    ranking = Object.values(ranking).sort((a, b) => {
      if (a.score > b.score) return -1
      if (a.score < b.score) return 1
      return 0
    })
    ranking.push({rank: ranking[ranking.length-1].rank + ranking[ranking.length-1].players.length, players: [{nick: ''}]})
    this.state = {ranking}
  }

  onChange = (data) => {
    this.props.onChange(data);
  }

  onChangePlayer = (i, j, playerName) => {
    let player = {}
    if (typeof playerName === 'string') {
      player = { nick: playerName }
    }
    else {
      player = playerName
    }
    let ranking = this.state.ranking
    ranking[i].players[j] = player
    ranking[i].players = ranking[i].players.filter(player => player.nick !== '')
    ranking = ranking.filter((score) => !(score.players.length === 0 || (score.players.length === 1 && score.players[0].nick === '')))
    // reindex rank after filter
    let rank = 1, playerNames = []
    ranking = ranking.map((score) => {
      score.rank = rank
      rank += score.players.length
      score.players.forEach(player => {
        playerNames.push(player.nick)
      })
      return score
    })
    ranking.push({rank: rank, players: [{nick: ''}]})
    this.setState({ranking})

    // convert to score structure
    let scores = [], points = 1
    ranking.reverse().forEach((score, index) => {
      let skip = 0
      score.players.forEach((player) => {
        if (player.nick !== '') {
          scores.push({
            score: points,
            players: [player],
            rank: score.rank,
          })
          skip++
        }
      })
      points = points + skip
    })
    ranking.reverse()
    scores = scores.reverse()
    scores[0].score++
    playerNames = playerNames.filter((value, index, self) => typeof value !== 'undefined' && value !== '' && self.indexOf(value) === index)
    this.onChange({ scores, playerNames })
  }

  onAddPlayerToRank = (i) => {
    let ranking = this.state.ranking
    ranking[i].players.push({nick: ''})
    ranking = ranking.map((score, j) => {
      if (j>i) {
        score.rank++
      }
      return score
    })
    this.setState({ranking})
  }

  getNumberWithOrdinal = (n) => {
    const s=["th","st","nd","rd"],
      v=(n)%100;
    return n+(s[(v-20)%10]||s[v]||s[0]);
  }

  render() {
    return (
      <>
        {this.state.ranking.map((score, i) => (
          <FormGroup key={i}>
            <Row>
              <Label for={`rank[${i}][players]`} sm={{size: 1, offset: 1}}>{this.getNumberWithOrdinal(score.rank)}</Label>
              <Col sm={9}>
                {score.players.map((player, j) => (
                  <Combobox key={j} placeholder="Nickname" value={player} textField="nick" data={this.props.playerList}
                            busy={this.props.playerList === null} filter={this.props.filterSelectablePlayers}
                            onChange={value => this.onChangePlayer(i, j, value)} name={`rank[${i}][players][${j}]`}
                            autoComplete="off"/>
                ))}
              </Col>
              <Col><Button className="col-12" onClick={() => {this.onAddPlayerToRank(i)}}>+</Button></Col>
            </Row>
          </FormGroup>
        ))}
      </>
    )
  }

}

export default ScoreRankingForm