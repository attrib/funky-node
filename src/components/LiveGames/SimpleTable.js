import {Component} from "react";
import {Table} from "reactstrap";
import PlayerNames from "../Player/PlayerNames";

class SimpleTable extends Component {

  render() {
    let liveScore = []
    this.props.result.scores.forEach((score, i) => {
      if (!score.liveScore) {
        score.liveScore = []
      }
      score.liveScore.forEach((point ,j) => {
        if (!liveScore[j]) {
          liveScore[j] = new Array(this.props.result.scores.length).fill('')
        }
        liveScore[j][i] = point
      })
    })

    return (
      <Table>
        <thead>
          <tr>
            {this.props.result.scores.map((score, i) => <th key={i}><PlayerNames players={score.players}/></th>)}
          </tr>
          <tr>
            {this.props.result.scores.map((score, i) => <th key={i}>{score.score}</th>)}
          </tr>
        </thead>
        <tbody>
        {liveScore.map((scores, i) => <tr key={i}>
            {scores.map((score, j) => <td key={j}>{score}</td>)}
          </tr>)
        }
        </tbody>
      </Table>
    )
  }

}

export default SimpleTable