import React  from 'react'
import { compose } from 'recompose'
import { Route, Switch } from 'react-router-dom'
import UserItem from './UserItem'
import UserList from './UserList'
import { withFirebase } from '../Firebase'
import { withAuthorization } from '../Session'
import * as ROLES from '../../constants/roles'
import * as ROUTES from '../../constants/routes'
import { Container } from 'reactstrap'

const AdminPage = () => (
  <div>
    <Container>
      <h1>Admin</h1>
      <p>The Admin Page is accessible by every signed in admin user.</p>
      <Switch>
        <Route exact path={ROUTES.ADMIN_DETAILS} component={UserItem}/>
        <Route exact path={ROUTES.ADMIN} component={UserList}/>
      </Switch>
    </Container>
  </div>
)

const condition = authUser =>
  authUser && !!authUser.roles[ROLES.ADMIN]

export default compose(
  withAuthorization(condition),
  withFirebase,
)(AdminPage)