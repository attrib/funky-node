import React, {Component} from 'react'

import { NavLink } from 'reactstrap'
import SessionStore from "../../stores/SessionStore";
import {withRouter} from "react-router-dom";
import * as ROUTES from "../../constants/routes";

class SignOutButton extends Component {

  onClick = () => {
    SessionStore.signOut()
    this.props.history.push(ROUTES.LANDING)
  }

  render() {
    return <NavLink onClick={this.onClick}>
      Sign Out
    </NavLink>
  }

}


export default withRouter(SignOutButton)