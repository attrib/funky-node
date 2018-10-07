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
import Api from '../Api'

class Profile extends Component {

  constructor(props) {
    super(props);
    this.toggle = this.toggle.bind(this);
    this.submitLogin = this.submitLogin.bind(this);
    this.submitRegister = this.submitRegister.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    extendObservable(this, {
      login: !props.user,
      nickname: props.user ? props.user.nickname : '',
      password: props.user ? props.user.password : '',
      email: props.user ? props.user.email : '',
      steamProfile: props.user ? props.user.steamProfile : '',
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
    Api.post('/user/login', {
      nickname: this.nickname,
      password: this.password,
    }).then(data => {
      if (!data.success) {
        this.error = data.error
      }
      else {
        Api.jwtToken = data.token
        this.props.changeUser(data.user)
        this.props.changePage('#stats')
      }
    })
  }

  submitRegister(ev) {
    ev.preventDefault()
    let path = '/user'
    let method = 'POST'
    if (this.props.user) {
      path = '/' + this.props.user.id
      method = 'PUT'
    }
    Api.doCall(method, path, {
      nickname: this.nickname,
      email: this.email,
      password: this.password,
      steamProfile: this.steamProfile,
    }).then(data => {
      if (!data.success) {
        this.error = data.error
      }
      else {
        Api.jwtToken = data.token
        this.props.changeUser(data.user)
        this.props.changePage('#stats')
      }
    })
  }

  render () {
    let error = ''
    if (this.error) {
      error = <Alert color="danger">
        {this.error}
      </Alert>
    }
    console.log(this.login);
    if (this.login) {
      return <Container>
        <Form>
          {error}
          <FormGroup row>
            <Label for="nickname" sm={2}>Login</Label>
            <Col sm={10}>
              <Input type="email" name="nickname" id="nickname" placeholder="Email or Nickname" onChange={this.handleInputChange} value={this.nickname} />
            </Col>
          </FormGroup>
          <FormGroup row>
            <Label for="password" sm={2}>Password</Label>
            <Col sm={10}>
              <Input type="password" name="password" id="password" placeholder="password" onChange={this.handleInputChange} value={this.password} />
            </Col>
          </FormGroup>
          <FormGroup row>
            <Col sm={{size: 4, offset: 6}}>
              <Button color="primary" onClick={this.toggle} block>No Account yet? Register</Button>
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
              <Input type="text" name="nickname" id="nickname" placeholder="Nickname" onChange={this.handleInputChange} value={this.nickname} />
            </Col>
          </FormGroup>
          <FormGroup row>
            <Label for="name" sm={2}>E-Mail</Label>
            <Col sm={10}>
              <Input type="email" name="email" id="email" placeholder="Email" onChange={this.handleInputChange} value={this.email} />
            </Col>
          </FormGroup>
          <FormGroup row>
            <Label for="password" sm={2}>Password</Label>
            <Col sm={10}>
              <Input type="password" name="password" id="password" placeholder="password" onChange={this.handleInputChange} value={this.password} />
            </Col>
          </FormGroup>
          <FormGroup row>
            <Label for="steamProfile" sm={2}>Steam profile URL</Label>
            <Col sm={10}>
              <Input type="text" name="steamProfile" id="steamProfile" placeholder="https://steamcommunity.com/user/attrib" onChange={this.handleInputChange} value={this.steamProfile} />
            </Col>
          </FormGroup>
          <FormGroup row>
            <Col sm={{size: 4, offset: 6}}>
              <Button color="primary" onClick={this.toggle} block>Already an account? Login</Button>
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

export default observer(Profile)