import React from 'react'
import { withRouter } from 'react-router-dom'

import * as ROUTES from '../../constants/routes'
import SessionStore from "../../stores/SessionStore";
import {reaction} from "mobx";

const withAuthorization = condition => Component => {
  class WithAuthorization extends React.Component {
    componentDidMount () {
      if (!condition(SessionStore.user)) {
        this.props.history.push(ROUTES.SIGN_IN)
      }
      reaction(
        () => SessionStore.user,
        (authUser) => {
          if (!condition(authUser)) {
            this.props.history.push(ROUTES.SIGN_IN)
          }
        })
    }

    render () {
      if (condition(SessionStore.user)) {
        return <Component {...this.props} />
      }
      else {
        return null
      }
    }
  }

  return withRouter(WithAuthorization)
}

export default withAuthorization