import * as ROUTES from '../../constants/routes'
import React, { Component } from 'react'
import { compose } from 'recompose'
import { withRouter } from 'react-router-dom'
import { Button, Form, Input, Alert, FormGroup } from 'reactstrap'
import BackendService, {authService} from "../../services/BackendService";

const INITIAL_STATE = {
  username: '',
  passwordOne: '',
  passwordTwo: '',
  error: null,
}

class SignUpForm extends Component {
  constructor (props) {
    super(props)

    this.state = {...INITIAL_STATE}
    this.userService = new BackendService('user')
  }

  onSubmit = event => {
    const {username, passwordOne} = this.state
    const user = {
      username,
      password: passwordOne
    }
    this.userService.post(user)
      .then((authUser) => {
        return authService.login(username, passwordOne)
      })
      .then(() => {
        this.setState({...INITIAL_STATE})
        this.props.history.push(ROUTES.HOME)
      })
      .catch((error) => {
        console.log(error)
        this.setState({error: error.error})
      })

    event.preventDefault()
  }

  onChange = event => {
    this.setState({[event.target.name]: event.target.value})
  }

  render () {
    const {
      username,
      passwordOne,
      passwordTwo,
      error,
    } = this.state

    const isInvalid =
      passwordOne !== passwordTwo ||
      passwordOne === '' ||
      username === ''

    return (
      <Form onSubmit={this.onSubmit}>
        {error && <Alert>{error.message}</Alert>}
        <FormGroup>
          <Input
            name="username"
            value={username}
            onChange={this.onChange}
            type="text"
            placeholder="User name"
          />
        </FormGroup>
        <FormGroup>
          <Input
            name="passwordOne"
            value={passwordOne}
            onChange={this.onChange}
            type="password"
            placeholder="Password"
          />
        </FormGroup>
        <FormGroup>
          <Input
            name="passwordTwo"
            value={passwordTwo}
            onChange={this.onChange}
            type="password"
            placeholder="Confirm Password"
          />
        </FormGroup>
        <Button disabled={isInvalid} type="submit" className="col-sm-12 col-md-3 offset-md-9">
          Sign Up
        </Button>
      </Form>
    )
  }
}

export default compose(
  withRouter,
)(SignUpForm)
