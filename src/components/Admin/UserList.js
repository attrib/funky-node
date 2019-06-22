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

    this.unsubscribe = this.props.firebase.users((usersList) => {
      this.setState({
        users: usersList.docs,
        loading: false,
      })
    }, (error) => {
      console.log(error)
    })
  }

  componentWillUnmount () {
    this.unsubscribe()
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
            const userData = user.data()
            return (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{userData.username}</td>
              <td><Roles roles={userData.roles}/></td>
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
    {Object.keys(roles).map(role => (
      <li key={role}>{role}</li>
    ))}
  </ul>
)


export default withFirebase(UserList)