import React, { Component } from 'react'
import { Link } from 'react-router-dom'

import * as ROUTES from '../../constants/routes'
import { Container, Form, FormGroup, Input, Alert, Button } from 'reactstrap'

const PasswordForgetPage = () => (
  <div>
    <Container>
      <h1>Recover Password</h1>
      <p>If you forgot your password, type in your Mail and follow the instructions.</p>
      <PasswordForgetForm/>
    </Container>
  </div>
)

const INITIAL_STATE = {
  email: '',
  error: null,
}

class PasswordForgetFormBase extends Component {
  constructor (props) {
    super(props)

    this.state = {...INITIAL_STATE}
  }

  onSubmit = event => {
    const {email} = this.state

    this.props.firebase
      .doPasswordReset(email)
      .then(() => {
        this.setState({...INITIAL_STATE})
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
    const {email, error} = this.state

    const isInvalid = email === ''

    return (
      <Form onSubmit={this.onSubmit}>
        {error && <Alert>{error.message}</Alert>}
        <FormGroup>
          <Input
            name="email"
            value={this.state.email}
            onChange={this.onChange}
            type="text"
            placeholder="Email Address"
          />
        </FormGroup>
        <Button disabled={isInvalid} type="submit" className="col-sm-12 col-md-3 offset-md-9">
          Reset My Password
        </Button>
      </Form>
    )
  }
}

const PasswordForgetLink = () => (
  <p>
    <Link to={ROUTES.PASSWORD_FORGET}>Forgot Password?</Link>
  </p>
)

export default PasswordForgetPage

const PasswordForgetForm = PasswordForgetFormBase

export { PasswordForgetForm, PasswordForgetLink }