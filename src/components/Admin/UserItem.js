import React, { Component } from 'react'
import { withFirebase } from '../Firebase'
import { Button, Col, Row } from 'reactstrap'
import { Multiselect } from 'react-widgets'
import * as ROLES from '../../constants/roles'
import 'react-widgets/lib/scss/react-widgets.scss'

class UserItem extends Component {
  constructor (props) {
    super(props)
    this.state = {
      loading: false,
      user: null,
      savingRole: false,
    }
  }

  componentDidMount () {
    if (this.state.user) {
      return
    }

    this.setState({loading: true})
    this.props.firebase
      .user(this.props.match.params.id)
      .get()
      .then(doc => {
        this.setState({
          user: doc,
          loading: false,
        })
      })
  }

  onSendPasswordResetEmail = () => {
    this.props.firebase.doPasswordReset(this.state.user.email)
  }

  onChangeRole = (rolesValue) => {
    let user = this.state.user
    let roles = {}
    rolesValue.forEach((role) => {
      roles[role] = role
    })

    this.setState({
      savingRole: true,
    })
    user.ref.update({roles})
      .then(() => {
        return user.ref.get()
      })
      .then((doc) => {
        this.setState({
          user: doc,
          savingRole: false,
        })
      })
  }

  render () {
    const {user, loading, savingRole} = this.state
    const userData = user ? user.data() : null
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
              <Col>{userData.email}</Col>
            </Row>
            <Row>
              <Col><strong>Username:</strong></Col>
              <Col>{userData.username}</Col>
            </Row>
            <Row>
              <Col><strong>Roles</strong></Col>
              <Col><Multiselect placholder="Roles" data={Object.values(ROLES)} value={Object.keys(userData.roles)} onChange={this.onChangeRole} busy={savingRole}/></Col>
            </Row>
            <Row>
              <Button
                type="button"
                onClick={this.onSendPasswordResetEmail}
                className="col-sm-12 col-md-3 offset-md-9"
              >
              Send Password Reset
              </Button>
            </Row>
          </>
        )}
      </div>
    )
  }
}

export default withFirebase(UserItem)