import React, { Component } from 'react';
import {
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Container,
  Col,
  Alert,
} from 'reactstrap';
import {extendObservable} from "mobx"
import {observer} from 'mobx-react'

class Login extends Component {

  constructor(props) {
    super(props);
    this.toggle = this.toggle.bind(this);
    this.submitLogin = this.submitLogin.bind(this);
    this.submitRegister = this.submitRegister.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    extendObservable(this, {
      login: true,
      name: '',
      password: '',
      nickname: '',
      email: '',
      steamProfile: '',
      error: '',
    })
  }

  toggle() {
    this.login = !this.login
  }

  handleInputChange(ev) {
    this[ev.target.name] = ev.target.value
  }

  submitLogin(ev) {
    ev.preventDefault()
    fetch(process.env.REACT_APP_API_URL + '/v1/user/login', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: this.name,
        password: this.password,
      })
    }).then(results => results.json())
      .then(data => {
        if (!data.success) {
          this.error = data.error
        }
      })
      .catch(reason => {
        console.error(reason)
        this.error = reason
      })
  }

  submitRegister(ev) {
    ev.preventDefault()
  }

  render () {
    let error = ''
    if (this.error) {
      error = <Alert color="danger">
        {this.error}
      </Alert>
    }
    if (this.login) {
      return <Container>
        <Form>
          {error}
          <FormGroup row>
            <Label for="name" sm={2}>Login</Label>
            <Col sm={10}>
              <Input type="email" name="name" id="name" placeholder="Email or Nickname" onChange={this.handleInputChange} value={this.name} />
            </Col>
          </FormGroup>
          <FormGroup row>
            <Label for="password" sm={2}>Password</Label>
            <Col sm={10}>
              <Input type="password" name="password" id="password" placeholder="password" onChange={this.handleInputChange} value={this.password} />
            </Col>
          </FormGroup>
          <FormGroup row>
            <Col sm={{size: 2, offset: 8}}>
              <Button color="primary" onClick={this.toggle} block>Register</Button>
            </Col>
            <Col sm={2}>
              <Button color="success" onClick={this.submitLogin} block>Submit</Button>
            </Col>
          </FormGroup>
        </Form>
      </Container>
    }
    else {
      return <Container>
        <Form>
          {error}
          <FormGroup row>
            <Label for="nickname" sm={2}>Nickname</Label>
            <Col sm={10}>
              <Input type="text" name="nickname" id="nickname" placeholder="Nickname" onChange={this.handleInputChange} />
            </Col>
          </FormGroup>
          <FormGroup row>
            <Label for="name" sm={2}>E-Mail</Label>
            <Col sm={10}>
              <Input type="email" name="email" id="email" placeholder="Email" onChange={this.handleInputChange} />
            </Col>
          </FormGroup>
          <FormGroup row>
            <Label for="password" sm={2}>Password</Label>
            <Col sm={10}>
              <Input type="password" name="password" id="password" placeholder="password" onChange={this.handleInputChange} />
            </Col>
          </FormGroup>
          <FormGroup row>
            <Label for="steamProfile" sm={2}>Steam profile URL</Label>
            <Col sm={10}>
              <Input type="text" name="steamProfile" id="steamProfile" placeholder="https://steamcommunity.com/user/attrib" onChange={this.handleInputChange} />
            </Col>
          </FormGroup>
          <FormGroup row>
            <Col sm={{size: 2, offset: 8}}>
              <Button color="primary" onClick={this.toggle} block>Login</Button>
            </Col>
            <Col sm={2}>
              <Button color="success" onClick={this.submitLogin} block>Submit</Button>
            </Col>
          </FormGroup>

        </Form>
      </Container>
    }
  }
}

export default observer(Login)