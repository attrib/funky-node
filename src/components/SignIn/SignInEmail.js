import * as ROUTES from '../../constants/routes'
import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import { Form, Input, Button, FormGroup, Alert, Col, Row } from 'reactstrap'
import SignUpLink from '../SignUp/SignUpLink'
import {authService} from "../../services/BackendService";

const INITIAL_STATE = {
  username: '',
  password: '',
  error: null,
}


class SignInEmail extends Component {
  constructor (props) {
    super(props)

    this.state = {...INITIAL_STATE}
  }

  onSubmit = event => {
    const {username, password} = this.state

    authService.login(username, password)
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
    const {username, password, error} = this.state

    const isInvalid = password === '' || username === ''

    return (
      <Form onSubmit={this.onSubmit} className="login">
        {error && <Alert>{error.message}</Alert>}
        <FormGroup>
          <Input
            name="username"
            value={username}
            onChange={this.onChange}
            type="text"
            placeholder="Username"
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
          {/*<PasswordForgetLink/>*/}
        </FormGroup>
        <Row>
          <Button disabled={isInvalid} type="submit" className="col-sm-12 col-md-3 offset-md-4">
            Sign In
          </Button>
          <Col sm="12" md={{ size: 6, offset: 4 }}>
            <SignUpLink/>
          </Col>
        </Row>
      </Form>
    )
  }
}

export default withRouter(SignInEmail)
