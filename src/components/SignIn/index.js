import React  from 'react'
import SignInEmail from './SignInEmail'
import { Container } from 'reactstrap'

const SignInPage = () => (
  <div>
      <Container>
        <h1>Login</h1>
        <SignInEmail/>
      </Container>
  </div>
)

export default SignInPage