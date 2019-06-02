import React, { Component } from 'react'
import { compose } from 'recompose'
import { withFirebase } from '../Firebase'
import { withRouter } from 'react-router-dom'

const ERROR_CODE_ACCOUNT_EXISTS =
  'auth/account-exists-with-different-credential'
const ERROR_MSG_ACCOUNT_EXISTS = `
An account with an E-Mail address to
this social account already exists. Try to login from
this account instead and associate your social accounts on
your personal account page.`

class SignInGoogle extends Component {
  constructor (props) {
    super(props)
    this.state = {error: null}
  }

  onSubmit = event => {
    this.props.firebase
      .doSignInWithGoogle()
      .then(socialAuthUser => {
        // Create a user in your Firebase Realtime Database too
        return this.props.firebase
          .user(socialAuthUser.user.uid)
          .set({
            username: socialAuthUser.user.displayName,
            email: socialAuthUser.user.email,
            roles: {},
          })
      })
      .catch(error => {
        if (error.code === ERROR_CODE_ACCOUNT_EXISTS) {
          error.message = ERROR_MSG_ACCOUNT_EXISTS
        }
        this.setState({error})
      })
    event.preventDefault()
  }

  render () {
    const {error} = this.state
    return (
      <form onSubmit={this.onSubmit}>
        <button type="submit">Sign In with Google</button>
        {error && <p>{error.message}</p>}
      </form>
    )
  }
}

export default compose(
  withRouter,
  withFirebase,
)(SignInGoogle)