import React  from 'react'

import PasswordChangeForm from './PasswordChange'
import { AuthUserContext, withAuthorization } from '../Session'
import { Container } from 'reactstrap'
import LoginManagement from './LoginManagement'
import LinkedPlayers from './LinkedPlayers'

const AccountPage = () => (
  <AuthUserContext.Consumer>
    {authUser => (
      <div>
        <Container>
          <h1>{authUser.username}</h1>
          <PasswordChangeForm/>
          <LoginManagement authUser={authUser}/>
          <LinkedPlayers user={authUser}/>
        </Container>
      </div>
    )}
  </AuthUserContext.Consumer>
)

const condition = authUser => !!authUser

export default withAuthorization(condition)(AccountPage)