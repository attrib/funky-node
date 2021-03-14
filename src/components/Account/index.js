import React  from 'react'

import PasswordChangeForm from './PasswordChange'
import { Container } from 'reactstrap'
import LinkedPlayers from './LinkedPlayers'
import SessionStore from "../../stores/SessionStore";
import withAuthorization from "../Utils/withAuthorization";

const AccountPage = () => (
    <div>
      <Container>
        <h1>{SessionStore.user.username}</h1>
        <PasswordChangeForm/>
        <LinkedPlayers user={SessionStore.user}/>
      </Container>
    </div>
)

const condition = authUser => !!authUser

export default withAuthorization(condition)(AccountPage)