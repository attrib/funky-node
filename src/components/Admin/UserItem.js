import React, { Component } from 'react'
import { withFirebase } from '../Firebase'
import { Button, Col, Row } from 'reactstrap'

class UserItem extends Component {
  constructor (props) {
    super(props)
    this.state = {
      loading: false,
      user: null,
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

  render () {
    const {user, loading} = this.state
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