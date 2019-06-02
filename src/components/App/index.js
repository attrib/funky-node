import React from 'react'
import { BrowserRouter as Router, Route, } from 'react-router-dom'

import Navigation from '../Navigation'
import LandingPage from '../Landing'
import SignUpPage from '../SignUp'
import SignInPage from '../SignIn'
import PasswordForgetPage from '../Account/PasswordForget'
import HomePage from '../Home'
import AccountPage from '../Account'
import AdminPage from '../Admin'
import Games from '../Games'
import Game from '../Games/Game'

import * as ROUTES from '../../constants/routes'
import { withAuthentication } from '../Session'

const App = () => (
  <Router>
    <div>
      <Navigation/>

      <Route exact path={ROUTES.LANDING} component={LandingPage}/>
      <Route path={ROUTES.NEWS} component={LandingPage}/>
      <Route path={ROUTES.SIGN_UP} component={SignUpPage}/>
      <Route path={ROUTES.SIGN_IN} component={SignInPage}/>
      <Route path={ROUTES.PASSWORD_FORGET} component={PasswordForgetPage}/>
      <Route path={ROUTES.HOME} component={HomePage}/>
      <Route path={ROUTES.ACCOUNT} component={AccountPage}/>
      <Route path={ROUTES.ADMIN} component={AdminPage}/>
      <Route exact path={ROUTES.GAMES} component={Games}/>
      <Route path={ROUTES.GAME} component={Game}/>
    </div>
  </Router>
)

export default withAuthentication(App)
