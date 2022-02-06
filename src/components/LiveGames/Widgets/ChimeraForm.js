import SimpleTableForm from "./SimpleTableForm";
import {FormFeedback, Input, Table, Tooltip} from "reactstrap";
import {Combobox} from "react-widgets";
import PlayerNames from "../../Player/PlayerNames";
import {toJS} from "mobx";
import React from "react";
import {BsCheckCircle, BsCircle, BsCircleFill, BsFillInfoCircleFill, BsXCircle} from "react-icons/bs";
import {AiFillMinusCircle, AiFillPlusCircle} from "react-icons/ai";
import './ChimeraForm.scss'

function emptyScore() {
  return {point: '', bonus: 0, bet: 0, win: 0}
}

class ChimeraForm extends SimpleTableForm {

  maxPlayer = 3
  maxPlayerPerTeam = 1

  constructor(props) {
    super(props);
    this.state = {
      boosterToolTip: false
    }
  }

  toggleBoosterToolTip = () => {
    this.setState({boosterToolTip: !this.state.boosterToolTip});
  }

  onChangeScore = (team, counter, score) => {
    let {scores, error} = this.props
    // populate liveScore
    if (scores[team].liveScore.length <= counter) {
      scores[team].liveScore = scores[team].liveScore.concat(new Array(counter - scores[team].liveScore.length + 1).fill(emptyScore()))
    }
    // for better typing allow -, 0 and empty string
    // otherwise you have to type 11 and then - (-11)
    if (score !== '-0' && score !== '' && score !== '-' && !isNaN(Number(score))) {
      scores[team].liveScore[counter].point = Number(score)
      delete error[`scores[${team}][liveScore][${counter}]`]
    }
    else {
      scores[team].liveScore[counter].point = score
      if (score !== '-0' && score !== '' && score !== '-') {
        error[`scores[${team}][liveScore][${counter}]`] = 'Invalid number'
      }
    }

    // filter out empty lines
    let deleteLine = true
    scores.forEach((score, team) => {
      if (score.liveScore[counter] && (score.liveScore[counter].point !== '' || score.liveScore[counter].bet !== 0)) {
        console.log(score.liveScore[counter])
        deleteLine = false
      }
    })
    if (deleteLine) {
      scores.forEach((score, team) => {
        delete error[`scores[${team}][liveScore][${counter}]`]
        score.liveScore.splice(counter, 1)
      })
    }

    this.updateScore(scores)
  }

  onChangeBonus = (counter, bonusChange) => {
    let {scores} = this.props
    // populate liveScore
    if (scores[0].liveScore.length <= counter) {
      scores[0].liveScore = scores[0].liveScore.concat(new Array(counter - scores[0].liveScore.length + 1).fill(emptyScore()))
    }
    scores[0].liveScore[counter].bonus = Math.max(0, Number(scores[0].liveScore[counter].bonus) + Number(bonusChange))
    this.updateScore(scores)
  }

  onChangeBet = (team, counter, bet) => {
    let {scores} = this.props
    // populate liveScore
    if (scores[team].liveScore.length <= counter) {
      scores[team].liveScore = scores[team].liveScore.concat(new Array(counter - scores[team].liveScore.length + 1).fill(emptyScore()))
    }
    if (scores[team].liveScore[counter].bet === Number(bet)) {
      scores[team].liveScore[counter].bet = 0
    }
    else {
      scores[team].liveScore[counter].bet = Number(bet)
    }
    this.updateScore(scores)
  }

  onChangeSetWin = (counter, win) => {
    let {scores} = this.props
    let maxBet = 0, maxTeam = 0
    for (let team in scores) {
      // populate liveScore
      if (scores[team].liveScore.length <= counter) {
        scores[team].liveScore = scores[team].liveScore.concat(new Array(counter - scores[team].liveScore.length + 1).fill(emptyScore()))
      }
      scores[team].liveScore[counter].win = 0
      if (scores[team].liveScore[counter].bet > maxBet) {
        maxBet = scores[team].liveScore[counter].bet
        maxTeam = team
      }
    }
    scores[maxTeam].liveScore[counter].win = win ? 2 * maxBet + scores[0].liveScore[counter].bonus : -1 * maxBet
    if (!win) {
      for (let team in scores) {
        if (team !== maxTeam) {
          scores[team].liveScore[counter].win = 20
        }
      }
    }

    this.updateScore(scores)
  }

  updateScore = (scores) => {
    // call total score
    for (let team in scores) {
      scores[team].score = scores[team].liveScore.reduce((agg, point, index) => {
        const points = !isNaN(Number(point.point)) ? Number(point.point) : 0
        return agg + points + point.win
      }, 0)
    }

    this.onChange({scores})
    // start timer for scoreUpdate
    if (this.timer) {
      clearTimeout(this.timer)
    }
    this.timer = setTimeout(this.scoreUpdate, 2000)
  }

  calcGameValue = (scoreLine) => {
    const maxBet = []
    for (let team of scoreLine) {
      maxBet.push(team.bet)
    }
    return Math.max(...maxBet) * 2 + scoreLine[0].bonus
  }

  render () {
    const { scores, error, isNew } = this.props

    let liveScore = []
    scores.forEach((score, i) => {
      if (!score.liveScore) {
        score.liveScore = []
      }
      score.liveScore.forEach((point ,j) => {
        if (!liveScore[j]) {
          liveScore[j] = new Array(scores.length).fill(emptyScore())
        }
        liveScore[j][i] = point
      })
    })
    // fix to 3 players
    while (scores.length < this.maxPlayer) {
      scores.push({score: 0, players: [{nick: ''}], liveScore: []})
    }
    while (scores.length > this.maxPlayer) {
      scores.pop()
    }
    // add new line at the end
    liveScore.push(new Array(scores.length).fill(emptyScore()))

    const scoreValueTotal = liveScore.reduce((p,c) => p + this.calcGameValue(c), 0)

    return (
      <Table style={{textAlign: 'center'}} className="mt-4 chimera-form">
        <thead>
        <tr>
          {scores.map((score, i) => (
            <th key={`thead-players-${i}`} colSpan="2">
              {isNew && (
                <>
                  {score.players.map((player, j) => (
                    <Combobox key={`thead-players-${i}-${j}`} placeholder="Nickname" value={player} textField="nick" data={this.props.playerList}
                              busy={this.props.playerList === null} filter={this.props.filterSelectablePlayers}
                              onChange={value => this.onChangePlayer(i, j, value)} name={`scores[${i}][players][${j}]`}
                              autoComplete="off"/>
                  ))}
                </>
              )}
              {!isNew && <PlayerNames players={toJS(score.players)} />}
            </th>
          ))}
          <th id="booster">Bonus <BsFillInfoCircleFill/><Tooltip isOpen={this.state.boosterToolTip} target="booster" toggle={this.toggleBoosterToolTip}><ul><li>Für jede ausgespielte Falle</li><li>Für jeden Spieler der keine Karten gespielt hat</li></ul></Tooltip></th>
          <th>Wert</th>
        </tr>
        <tr>
          {scores.map((score, i) => (
            <th key={`thead-score-${i}`} colSpan="2">
              {score.score}
            </th>
          ))}
          <th></th>
          <th>{scoreValueTotal}</th>
        </tr>
        </thead>
        <tbody>
        { isNew && (
          <tr>
            <td colSpan={scores.length * 2 + 2}>To start the game, save once. After that the team can't be changed anymore</td>
          </tr>
        )}
        { !isNew && (
          <>
            {liveScore.map((teams, i) => (
              <tr key={`tbody-score-${i}`}>
                {teams.map((points, j) => (
                  <React.Fragment key={`tbody-score-${i}-${j}`}>
                    <td>
                      {points.win ? points.win + ' + ' : ''}<Input type="Number" value={points.point}
                             onChange={event => this.onChangeScore(j, i, event.target.value)}
                             name={`scores[${j}][liveScore][${i}]`} autoComplete="off" invalid={!!error[`scores[${j}][liveScore][${i}]`]} style={points.win ? {width: 'calc(100% - 3em)', display: 'inline-block'} : {}}/>
                      {error[`scores[${j}][liveScore][${i}]`] && <FormFeedback>{error[`scores[${j}][liveScore][${i}]`]}</FormFeedback>}
                    </td>
                    <td className="bet">
                      <span onClick={() => this.onChangeBet(j, i, 20)}>{points.bet === 20 ? <BsCircleFill/> : <BsCircle/>}</span><span onClick={() => this.onChangeBet(j, i, 30)} >{points.bet === 30 ? <BsCircleFill/> : <BsCircle/>}</span><span onClick={() => this.onChangeBet(j, i, 40)}>{points.bet === 40 ? <BsCircleFill/> : <BsCircle/>}</span>
                    </td>
                  </React.Fragment>
                ))}
                <td><AiFillMinusCircle onClick={() => this.onChangeBonus(i, -25)}/> {teams[0].bonus} <AiFillPlusCircle onClick={() => this.onChangeBonus(i, 25)}/></td>
                <td><BsXCircle onClick={() => this.onChangeSetWin(i, false)}/> {this.calcGameValue(teams)} <BsCheckCircle onClick={() => this.onChangeSetWin(i, true)} /></td>
              </tr>
            ))}
          </>
        )}
        </tbody>
      </Table>
    )
  }


}

export default ChimeraForm
export {emptyScore}