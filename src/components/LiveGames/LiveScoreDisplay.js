import {Component} from "react";
import SimpleTable from "./SimpleTable";

class LiveScoreDisplay extends Component {
  liveScoreWidget = {
    'SimpleTableForm': SimpleTable
  }

  render() {
    const LiveScore = this.liveScoreWidget[this.props.result.livescore_widget];
    return (<LiveScore result={this.props.result}/>)
  }
}

export default LiveScoreDisplay