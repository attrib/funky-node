import React, { Component } from 'react'

import { Form, FormGroup, Alert, Button, Input } from 'reactstrap'
import BackendService from "../../services/BackendService";
import SessionStore from "../../stores/SessionStore";

const INITIAL_STATE = {
  passwordOne: '',
  passwordTwo: '',
  error: null,
}

class PasswordChangeForm extends Component {
  constructor (props) {
    super(props)

    this.state = {...INITIAL_STATE}
    this.userService = new BackendService('user')
  }

  onSubmit = event => {
    const {passwordOne} = this.state

    this.userService.patch(SessionStore.user.id, {password: passwordOne})
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
    const {passwordOne, passwordTwo, error} = this.state

    const isInvalid =
      passwordOne !== passwordTwo || passwordOne === ''

    return (
      <Form onSubmit={this.onSubmit}>
        <h2>Change Password</h2>
        {error && <Alert>{error.message}</Alert>}
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
        <Button disabled={isInvalid} type="submit" className="col-sm-12 col-md-3 offset-md-9">
          Reset My Password
        </Button>
      </Form>
    )
  }
}

export default PasswordChangeForm