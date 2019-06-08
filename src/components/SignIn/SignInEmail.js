import * as ROUTES from '../../constants/routes'
import React, { Component } from 'react'
import { compose } from 'recompose'
import { withFirebase } from '../Firebase'
import { withRouter } from 'react-router-dom'
import { Form, Input, Button, FormGroup, Alert, Col, Row } from 'reactstrap'
import SignInGoogle from './SignInGoogle'
import { PasswordForgetLink } from '../Account/PasswordForget'
import SignUpLink from '../SignUp/SignUpLink'

const INITIAL_STATE = {
  email: '',
  password: '',
  error: null,
}


class SignInEmail extends Component {
  constructor (props) {
    super(props)

    this.state = {...INITIAL_STATE}
  }

  onSubmit = event => {
    const {email, password} = this.state

    this.props.firebase
      .doSignInWithEmailAndPassword(email, password)
      .then(() => {
        this.setState({...INITIAL_STATE})
        this.props.history.push(ROUTES.HOME)
      })
      .catch(error => {
        this.setState({error})
      })

    event.preventDefault()
  }

  onChange = event => {
    this.setState({[event.target.name]: event.target.value})
  }

  render () {
    const {email, password, error} = this.state

    const isInvalid = password === '' || email === ''

    return (
      <Form onSubmit={this.onSubmit} className="login">
        {error && <Alert>{error.message}</Alert>}
        <FormGroup>
          <Input
            name="email"
            value={email}
            onChange={this.onChange}
            type="text"
            placeholder="Email Address"
          />
        </FormGroup>
        <FormGroup>
        <Input
            name="password"
            value={password}
            onChange={this.onChange}
            type="password"
            placeholder="Password"
          />
          <PasswordForgetLink/>
        </FormGroup>
        <Row>
          <Button disabled={isInvalid} type="submit" className="col-sm-12 col-md-3 offset-md-3">
            Sign In
          </Button>
          <SignInGoogle/>
          <Col sm="12" md={{ size: 6, offset: 3 }}>
            <SignUpLink/>
          </Col>
        </Row>
      </Form>
    )
  }
}

export default compose(
  withRouter,
  withFirebase,
)(SignInEmail)
