import { Link } from 'react-router-dom'
import * as ROUTES from '../../constants/routes'
import React, { Component } from 'react'
import { withFirebase } from '../Firebase'

class UserList extends Component {
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

const Roles = ({roles}) => (
  <ul>
    {Object.keys(roles).map(role => (
      <li key={role}>{role}</li>
    ))}
  </ul>
)


export default withFirebase(UserList)