import React, {Component} from "react";
import ChimeraForm from "./ChimeraForm";
import SimpleTableForm from "./SimpleTableForm";
import SimpleTable from "./SimpleTable";
import {Alert} from "reactstrap";
import ChimeraTable from "./ChimeraTable";

const liveGameWidgets = {
  simpleTable: {
    form: SimpleTableForm,
    display: SimpleTable
  },
  chimera: {
    form: ChimeraForm,
    display: ChimeraTable
  }
}

class Widget extends Component {

  static getWidgetId(game) {
    if (game.livegame_widget && liveGameWidgets[game.livegame_widget]) {
      return game.livegame_widget
    }
    else if (game.score_widget !== 'ScoreTeamForm') {
      return null
    }
    else {
      return 'simpleTable'
    }
  }

  render() {
    let Widget
    if (this.props.widget) {
      if (liveGameWidgets[this.props.widget]) {
        Widget = liveGameWidgets[this.props.widget]
      }
      else {
        return <span>Unknown live game widget {this.props.widget}</span>
      }
    }
    else if (!this.props.game) {
      return <span>Select a game</span>
    }
    else {
      const id = this.constructor.getWidgetId(this.props.game)
      if (id) {
        Widget = liveGameWidgets[id]
      }
      else {
        return <Alert color="danger">Games with ranking, doesn't support live games.</Alert>
      }
    }
    Widget = Widget[this.props.type]

    return <Widget {...this.props} />
  }

}

export default Widget
export {liveGameWidgets}