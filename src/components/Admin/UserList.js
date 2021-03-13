import { Link } from 'react-router-dom'
import * as ROUTES from '../../constants/routes'
import React, { Component } from 'react'
import { Table } from 'reactstrap'
import BackendService from "../../services/BackendService";

class UserList extends Component {
  constructor (props) {
    super(props)

    this.state = {
      loading: false,
      users: [],
    }
    this.userService = new BackendService('user')
  }

  componentDidMount () {
    this.setState({loading: true})

    this.userService.get()
      .then((users) => {
        this.setState({
          users: users,
          loading: false,
        })
      })
      .catch((error) => {
        console.log(error)
      })
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
          {users.map(user => {
            return (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.username}</td>
              <td><Roles roles={user.roles}/></td>
              <td>
                <Link
                  to={{
                    pathname: ROUTES.ADMIN_DETAILS.replace(':id', user.id),
                  }}
                >
                  Details
                </Link>
              </td>
            </tr>
          )})}
          </tbody>
        </Table>
      </div>
    )
  }
}

const Roles = ({roles}) => (
  <ul>
    {roles.map(role => (
      <li key={role}>{role}</li>
    ))}
  </ul>
)


export default UserList