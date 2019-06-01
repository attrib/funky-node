import React, {Component} from "react";
import { NavLink as RRNavLink } from 'react-router-dom'

import SignOutButton from '../SignOut';
import * as ROUTES from '../../constants/routes'
import * as ROLES from '../../constants/roles';
import { Collapse, Nav, Navbar, NavbarBrand, NavbarToggler, NavItem, NavLink } from 'reactstrap'
import { AuthUserContext } from '../Session';

const NavigationAuth = ({ authUser }) => (
  <>
    <NavLink tag={RRNavLink} exact to={ROUTES.GAMES} activeClassName="active">Games</NavLink>
    <NavItem>
      <NavLink tag={RRNavLink} exact to={ROUTES.HOME} activeClassName="active">Home</NavLink>
    </NavItem>
    <NavItem>
      <NavLink tag={RRNavLink} exact to={ROUTES.ACCOUNT} activeClassName="active">Account</NavLink>
    </NavItem>
    {!!authUser.roles[ROLES.ADMIN] && (
      <NavItem>
        <NavLink tag={RRNavLink} exact to={ROUTES.ADMIN} activeClassName="active">Admin</NavLink>
      </NavItem>
    )}
    <NavItem>
      <SignOutButton />
    </NavItem>
  </>
)

const NavigationNonAuth = () => (
  <>
    <NavItem>
      <NavLink tag={RRNavLink} exact to={ROUTES.GAMES} activeClassName="active">Games</NavLink>
      <NavLink tag={RRNavLink} exact to={ROUTES.SIGN_IN} activeClassName="active">Sign In</NavLink>
    </NavItem>
  </>
)


export class Navigation extends Component {
  constructor (props) {
    super(props)

    this.toggle = this.toggle.bind(this)
    this.state = {
      isOpen: false
    }
  }

  toggle () {
    this.setState({
      isOpen: !this.state.isOpen
    })
  }

  render () {
    return (
      <Navbar color="inverse" light expand="md">
        <NavbarBrand href={ROUTES.LANDING}>funky-clan</NavbarBrand>
        <NavbarToggler onClick={this.toggle} />
        <Collapse isOpen={this.state.isOpen} navbar>
          <Nav className="ml-auto" navbar>
            <AuthUserContext.Consumer>
              {authUser =>
                authUser ? (
                  <NavigationAuth authUser={authUser} />
                  ) : <NavigationNonAuth />
              }
            </AuthUserContext.Consumer>
          </Nav>
        </Collapse>
      </Navbar>
    )
  }
}

export default Navigation
