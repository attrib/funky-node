import React, { Component } from 'react'
import { Button, Form, FormGroup, Input, Row } from 'reactstrap'
import { withFirebase } from '../Firebase'

const SIGN_IN_METHODS = [
  {
    id: 'password',
    provider: null,
  },
  {
    id: 'google.com',
    provider: 'googleProvider',
  },
  // {
  //   id: 'facebook.com',
  //   provider: 'facebookProvider',
  // },
  // {
  //   id: 'twitter.com',
  //   provider: 'twitterProvider',
  // },
]


class LoginManagement extends Component {
  constructor (props) {
    super(props)
    this.state = {
      activeSignInMethods: [],
      error: null,
    }
  }

  componentDidMount () {
    this.fetchSignInMethods()
  }

  fetchSignInMethods = () => {
    this.props.firebase.auth
      .fetchSignInMethodsForEmail(this.props.authUser.email)
      .then(activeSignInMethods =>
        this.setState({activeSignInMethods, error: null}),
      )
      .catch(error => this.setState({error}))
  }

  onSocialLoginLink = provider => {
    this.props.firebase.auth.currentUser
      .linkWithPopup(this.props.firebase[provider])
      .then(this.fetchSignInMethods)
      .catch(error => this.setState({error}))
  }
  onUnlink = providerId => {
    this.props.firebase.auth.currentUser
      .unlink(providerId)
      .then(this.fetchSignInMethods)
      .catch(error => this.setState({error}))
  }

  onDefaultLoginLink = password => {
    const credential = this.props.firebase.emailAuthProvider.credential(
      this.props.authUser.email,
      password,
    )
    this.props.firebase.auth.currentUser
      .linkWithCredential(credential)
      .then(this.fetchSignInMethods)
      .catch(error => this.setState({error}))
  }

  render () {
    const {activeSignInMethods, error} = this.state

    return (
      <div>
        <h2>Sign In Methods</h2>
        <>
          {SIGN_IN_METHODS.map(signInMethod => {
            const onlyOneLeft = activeSignInMethods.length === 1
            const isEnabled = activeSignInMethods.includes(
              signInMethod.id,
            )

            return (
              <Row key={signInMethod.id} sm={3} md={3}>
                {signInMethod.id === 'password' ? (
                  <DefaultLoginToggle
                    onlyOneLeft={onlyOneLeft}
                    isEnabled={isEnabled}
                    signInMethod={signInMethod}
                    onLink={this.onDefaultLoginLink}
                    onUnlink={this.onUnlink}
                  />
                ) : (
                  <SocialLoginToggle
                    onlyOneLeft={onlyOneLeft}
                    isEnabled={isEnabled}
                    signInMethod={signInMethod}
                    onLink={this.onSocialLoginLink}
                    onUnlink={this.onUnlink}
                  />
                )}

              </Row>
            )
          })}
        </>
        {error && error.message}
      </div>
    )
  }
}

class DefaultLoginToggle extends Component {
  constructor (props) {
    super(props)
    this.state = {passwordOne: '', passwordTwo: ''}
  }

  onSubmit = event => {
    event.preventDefault()
    this.props.onLink(this.state.passwordOne)
    this.setState({passwordOne: '', passwordTwo: ''})
  }
  onChange = event => {
    this.setState({[event.target.name]: event.target.value})
  }

  render () {
    const {
      onlyOneLeft,
      isEnabled,
      signInMethod,
      onUnlink,
    } = this.props
    const {passwordOne, passwordTwo} = this.state
    const isInvalid =
      passwordOne !== passwordTwo || passwordOne === ''
    return isEnabled ? (
      <Button
        type="button"
        onClick={() => onUnlink(signInMethod.id)}
        disabled={onlyOneLeft}
        className="col-sm-12 col-md-3"
      >
        Deactivate {signInMethod.id}
      </Button>
    ) : (
      <Form onSubmit={this.onSubmit}>
        <FormGroup>
          <Input
            name="passwordOne"
            value={passwordOne}
            onChange={this.onChange}
            type="password"
            placeholder="New Password"
          />
        </FormGroup>
        <FormGroup>
          <Input
            name="passwordTwo"
            value={passwordTwo}
            onChange={this.onChange}
            type="password"
            placeholder="Confirm New Password"
          />
        </FormGroup>
        <Button disabled={isInvalid} type="submit">
          Link {signInMethod.id}
        </Button>
      </Form>
    )
  }
}

const SocialLoginToggle = ({
                             onlyOneLeft,
                             isEnabled,
                             signInMethod,
                             onLink,
                             onUnlink,
                           }) =>
  isEnabled ? (
    <Button
      type="button"
      onClick={() => onUnlink(signInMethod.id)}
      disabled={onlyOneLeft}
      className="col-sm-12 col-md-3"
    >
      Deactivate {signInMethod.id}
    </Button>
  ) : (
    <Button
      type="button"
      onClick={() => onLink(signInMethod.provider)}
      className="col-sm-12 col-md-3"
    >
      Link {signInMethod.id}
    </Button>
  )

export default withFirebase(LoginManagement)