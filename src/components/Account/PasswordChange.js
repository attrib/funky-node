import React, { Component } from 'react'

import { withFirebase } from '../Firebase'
import { Form, FormGroup, Alert, Button, Input } from 'reactstrap'

const INITIAL_STATE = {
  passwordOne: '',
  passwordTwo: '',
  error: null,
}

class PasswordChangeForm extends Component {
  constructor (props) {
    super(props)

    this.state = {...INITIAL_STATE}
  }

  onSubmit = event => {
    const {passwordOne} = this.state

    this.props.firebase
      .doPasswordUpdate(passwordOne)
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
        <p>Change Password</p>
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

export default withFirebase(PasswordChangeForm)