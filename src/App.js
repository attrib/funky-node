import React, { Component } from 'react';
import {
  Collapse,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink,
  Container
} from 'reactstrap';
import {extendObservable} from "mobx"
import {observer} from 'mobx-react'
import Home from './page/Home'
import Profile from './page/Profile'

class App extends Component {
  constructor(props) {
    super(props);

    this.toggle = this.toggle.bind(this);
    this.handleChangePage = this.handleChangePage.bind(this)
    this.changePage = this.changePage.bind(this)
    this.changeUser = this.changeUser.bind(this)
    extendObservable(this, {
      page: window.location.hash,
      isOpen: false,
      user: null,
    })
  }

  toggle() {
    this.isOpen = !this.isOpen;
  }

  handleChangePage(ev) {
    ev.preventDefault()
    this.changePage(new URL(ev.target.href).hash)
  }

  changePage(newPage) {
    window.history.pushState(this.state, document.title, newPage);
    this.page = newPage
  }

  changeUser(user) {
    this.user = user
  }

  render() {
    let page, title;
    switch (this.page) {
      case "#add-result":
        page = <Container>Coming soon.</Container>
        title = "Add game result"
        break;
      case "#stats":
        page = <Container>Coming soon.</Container>
        title = "Statistics"
        break;
      case "#results":
        page = <Container>Coming soon.</Container>
        title = "Results"
        break;
      case "#games":
        page = <Container>Coming soon.</Container>
        title = "Games"
        break;
      case "#profile":
        page = <Profile user={this.user} changePage={this.changePage} changeUser={this.changeUser}/>
        title = "Profile"
        break;
      default:
        page = <Home/>
        title = "Home"
        break;
    }
    document.title = "funky-clan | " + title
    return (
      <div>
        <Navbar color="inverse" light expand="md">
          <NavbarBrand href="#home" onClick={this.handleChangePage}>funky-clan</NavbarBrand>
          <NavbarToggler onClick={this.toggle} />
          <Collapse isOpen={this.isOpen} navbar>
            <Nav className="ml-auto" navbar>
              <NavItem active={this.page === "#add-result"}>
                <NavLink href="#add-result" onClick={this.handleChangePage}>Add result</NavLink>
              </NavItem>
              <NavItem active={this.page === "#stats"}>
                <NavLink href="#stats" onClick={this.handleChangePage}>Stats</NavLink>
              </NavItem>
              <NavItem active={this.page === "#results"}>
                <NavLink href="#results" onClick={this.handleChangePage}>Last results</NavLink>
              </NavItem>
              <NavItem active={this.page === "#games"}>
                <NavLink href="#games" onClick={this.handleChangePage}>Games</NavLink>
              </NavItem>
              <NavItem active={this.page === "#profile"}>
                <NavLink href="#profile" onClick={this.handleChangePage}>{ this.user ? "Profile" : "Login"}</NavLink>
              </NavItem>
            </Nav>
          </Collapse>
        </Navbar>
        {page}
      </div>
    );
  }
}

export default observer(App);