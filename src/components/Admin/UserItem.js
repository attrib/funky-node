import React, { Component } from 'react'
import { Button, Col, Row } from 'reactstrap'
import { Multiselect } from 'react-widgets'
import * as ROLES from '../../constants/roles'
import 'react-widgets/lib/scss/react-widgets.scss'
import BackendService from "../../services/BackendService";

class UserItem extends Component {
  constructor (props) {
    super(props)
    this.state = {
      loading: false,
      user: null,
      savingRole: false,
    }
    this.userService = new BackendService('user')
  }

  componentDidMount () {
    if (this.state.user) {
      return
    }

    this.setState({loading: true})
    this.userService.getId(this.props.match.params.id)
      .then((user) => {
        this.setState({
          user,
          loading: false,
        })
      })
  }

  onSendPasswordResetEmail = () => {
    this.props.firebase.doPasswordReset(this.state.user.email)
  }

  onChangeRole = (rolesValue) => {
    let user = this.state.user
    let rolesDelete = []
    this.state.user.roles.forEach((role) => {
      if (!rolesValue.includes(role)) {
        rolesDelete.push(role)
      }
    })

    this.setState({
      savingRole: true,
    })
    this.userService.patch(user.id, {roles: rolesValue, rolesDelete})
      .then((user) => {
        this.setState({
          user,
          savingRole: false,
        })
      })
  }

  render () {
    const {user, loading, savingRole} = this.state
    return (
      <div>
        <h2>User</h2>
        {loading && <div>Loading ...</div>}
        {user && (
          <>
            <Row>
              <Col><strong>ID:</strong></Col>
              <Col>{user.id}</Col>
            </Row>
            <Row>
              <Col><strong>E-Mail:</strong></Col>
              <Col>{user.email}</Col>
            </Row>
            <Row>
              <Col><strong>Username:</strong></Col>
              <Col>{user.username}</Col>
            </Row>
            <Row>
              <Col><strong>Roles</strong></Col>
              <Col><Multiselect placholder="Roles" data={Object.values(ROLES)} value={user.roles} onChange={this.onChangeRole} busy={savingRole}/></Col>
            </Row>
            <Row>
              {/*<Button*/}
              {/*  type="button"*/}
              {/*  onClick={this.onSendPasswordResetEmail}*/}
              {/*  className="col-sm-12 col-md-3 offset-md-9"*/}
              {/*>*/}
              {/*Send Password Reset*/}
              {/*</Button>*/}
            </Row>
          </>
        )}
      </div>
    )
  }
}

export default UserItem