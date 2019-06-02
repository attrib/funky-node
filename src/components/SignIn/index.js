import React  from 'react'
import SignInGoogle from './SignInGoogle'
import SignInEmail from './SignInEmail'
import SignUpLink from '../SignUp/SignUpLink'
import { PasswordForgetLink } from '../Account/PasswordForget'

const SignInPage = () => (
  <div>
    <h1>SignIn</h1>
    <SignInEmail/>
    <SignInGoogle/>
    <PasswordForgetLink/>
    <SignUpLink/>
  </div>
)

export default SignInPage