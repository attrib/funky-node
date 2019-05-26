import React, { Component } from 'react';
import { compose } from 'recompose';

import { withFirebase } from '../Firebase';
import { withAuthorization } from '../Session';
import * as ROLES from '../../constants/roles';

class AdminPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      users: [],
    };
  }

  componentDidMount() {
    this.setState({ loading: true });

    this.props.firebase.users()
      .then(snapshot => {
        let usersList = [];
        snapshot.forEach(document => {
          usersList.push({
            ...document.data(),
            uid: document.id,
          })
        })

        this.setState({
          users: usersList,
          loading: false,
        });
      })
      .catch(error => console.log(error));
  }

  render() {
    const { users, loading } = this.state;

    return (
      <div>
        <h1>Admin</h1>
        <p>
          The Admin Page is accessible by every signed in admin user.
        </p>

        {loading && <div>Loading ...</div>}

        <UserList users={users} />
      </div>
    );
  }
}

const UserList = ({ users }) => (
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
          <Roles roles={user.roles} />
        </span>
      </li>
    ))}
  </ul>
);

const Roles = ({ roles }) => (
  <ul>
    {Object.keys(roles).map(role => (
      <li key={role}>{role}</li>
    ))}
  </ul>
);

const condition = authUser =>
  authUser && !!authUser.roles[ROLES.ADMIN];

export default compose(
  withAuthorization(condition),
  withFirebase,
)(AdminPage);