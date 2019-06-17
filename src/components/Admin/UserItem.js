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
          user: {
            uid: doc.id,
            ...doc.data(),
          },
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

    user.roles = roles

    this.setState({
      user,
      savingRole: true,
    })

    this.props.firebase.user(user.uid).set({roles}, { merge: true })
      .then(() => {
        this.setState({
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
              <Col>{user.uid}</Col>
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
              <Col><Multiselect placholder="Roles" data={Object.values(ROLES)} value={Object.keys(user.roles)} onChange={this.onChangeRole} busy={savingRole}/></Col>
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