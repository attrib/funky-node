import React, { Component } from 'react'
import { compose } from 'recompose'
import { Link, Route, Switch } from 'react-router-dom'

import { withFirebase } from '../Firebase'
import { withAuthorization } from '../Session'
import * as ROLES from '../../constants/roles'
import * as ROUTES from '../../constants/routes'

const AdminPage = () => (
  <div>
    <h1>Admin</h1>
    <p>The Admin Page is accessible by every signed in admin user.</p>
    <Switch>
      <Route exact path={ROUTES.ADMIN_DETAILS} component={UserItem}/>
      <Route exact path={ROUTES.ADMIN} component={UserList}/>
    </Switch>
  </div>
)

class UserListBase extends Component {
  constructor (props) {
    super(props)

    this.state = {
      loading: false,
      users: [],
    }
  }

  componentDidMount () {
    this.setState({loading: true})

    this.props.firebase.users()
      .then(snapshot => {
        let usersList = []
        snapshot.forEach(document => {
          usersList.push({
            ...document.data(),
            uid: document.id,
          })
        })

        this.setState({
          users: usersList,
          loading: false,
        })
      })
      .catch(error => console.log(error))
  }

  render () {
    const {users, loading} = this.state

    return (
      <div>
        <h2>Users</h2>
        {loading && <div>Loading ...</div>}

        <ul>
          {users.map(user => (
            <li key={user.uid}>
        <span>
          <strong>ID:</strong> {user.uid}
        </span>
              <span>
          <strong>Username:</strong> {user.username}
        </span>
              <span>
          <strong>Roles: </strong>
          <Roles roles={user.roles}/>
        </span>
              <span>
<Link
  to={{
    pathname: `${ROUTES.ADMIN}/${user.uid}`,
    state: {user},
  }}
>
  Details
            </Link>
          </span>
            </li>
          ))}
        </ul>
      </div>
    )
  }
}

const UserList = withFirebase(UserListBase)

class UserItemBase extends Component {
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
        <h2>User ({this.props.match.params.id})</h2>
        {loading && <div>Loading ...</div>}
        {user && (
          <div>
            <span>
            <strong>ID:</strong> {user.uid}
            </span>
            <span>
            <strong>E-Mail:</strong> {user.email}
            </span>
            <span>
            <strong>Username:</strong> {user.username}
            </span>
            <span>
            <button
              type="button"
              onClick={this.onSendPasswordResetEmail}
            >
            Send Password Reset
            </button>
            </span>
          </div>
        )}
      </div>
    )
  }
}

const UserItem = withFirebase(UserItemBase)

const Roles = ({roles}) => (
  <ul>
    {Object.keys(roles).map(role => (
      <li key={role}>{role}</li>
    ))}
  </ul>
)

const condition = authUser =>
  authUser && !!authUser.roles[ROLES.ADMIN]

export default compose(
  withAuthorization(condition),
  withFirebase,
)(AdminPage)