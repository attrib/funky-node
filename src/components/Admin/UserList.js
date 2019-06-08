import { Link } from 'react-router-dom'
import * as ROUTES from '../../constants/routes'
import React, { Component } from 'react'
import { withFirebase } from '../Firebase'
import { Table } from 'reactstrap'

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

        <Table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Roles</th>
              <th>Operations</th>
            </tr>
          </thead>
          <tbody>
          {users.map(user => (
            <tr key={user.uid}>
              <td>{user.uid}</td>
              <td>{user.username}</td>
              <td><Roles roles={user.roles}/></td>
              <td>
                <Link
                  to={{
                    pathname: `${ROUTES.ADMIN}/${user.uid}`,
                    state: {user},
                  }}
                >
                  Details
                </Link>
              </td>
            </tr>
          ))}
          </tbody>
        </Table>
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