import React, {Component} from "react";
import {Nav, NavItem, NavLink, TabContent, TabPane} from "reactstrap";
import RankingTable from "./RankingTable";
import classnames from "classnames";

class TabbedRankingTable extends Component {

  static defaultProps = {
    filter: {}
  }

  constructor(props) {
    super(props);

    this.state = {
      groupBy: 'player'
    }
  }


  render() {
    const {filter} = this.props
    return (
      <div>
        <Nav tabs>
          <NavItem>
            <NavLink
              className={classnames({ active: this.state.groupBy === 'player' })}
              onClick={() => { this.setState({groupBy: 'player'}) }}
            >
              Player
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={classnames({ active: this.state.groupBy === 'team' })}
              onClick={() => { this.setState({groupBy: 'team'}) }}
            >
              Teams
            </NavLink>
          </NavItem>
        </Nav>
      <TabContent>
        <TabPane>
          <RankingTable filter={{...filter, by: this.state.groupBy}} />
        </TabPane>
      </TabContent>
     </div>
    )
  }

}

export default TabbedRankingTable