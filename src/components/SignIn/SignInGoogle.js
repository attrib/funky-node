import React, { Component } from 'react'
import { compose } from 'recompose'
import { withFirebase } from '../Firebase'
import { withRouter } from 'react-router-dom'
import { Alert, Button, Form } from 'reactstrap'

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
      <Form onSubmit={this.onSubmit} className="col-sm-12 col-md-3">
        <Button type="submit" className="col-12">Sign In with Google</Button>
        {error && <Alert>{error.message}</Alert>}
      </Form>
    )
  }
}

export default compose(
  withRouter,
  withFirebase,
)(SignInGoogle)