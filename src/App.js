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
import Home from './page/Home'

class App extends Component {
  constructor(props) {
    super(props);

    this.toggle = this.toggle.bind(this);
    this.changePage = this.changePage.bind(this)
    this.state = {
      page: window.location.hash,
      isOpen: false
    };
  }
  toggle() {
    this.setState({
      isOpen: !this.state.isOpen
    });
  }
  changePage(ev) {
    ev.preventDefault()
    window.history.pushState(this.state, document.title, ev.target.href);
    this.setState({
      page: new URL(ev.target.href).hash
    });
  }
  render() {
    let page, title;
    switch (this.state.page) {
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
        title = "Statistics"
        break;
      case "#games":
        page = <Container>Coming soon.</Container>
        title = "Games"
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
          <NavbarBrand href="#home" onClick={this.changePage}>funky-clan</NavbarBrand>
          <NavbarToggler onClick={this.toggle} />
          <Collapse isOpen={this.state.isOpen} navbar>
            <Nav className="ml-auto" navbar>
              <NavItem active={this.state.page === "#add-result"}>
                <NavLink href="#add-result" onClick={this.changePage}>Add result</NavLink>
              </NavItem>
              <NavItem active={this.state.page === "#stats"}>
                <NavLink href="#stats" onClick={this.changePage}>Stats</NavLink>
              </NavItem>
              <NavItem active={this.state.page === "#results"}>
                <NavLink href="#results" onClick={this.changePage}>Last results</NavLink>
              </NavItem>
              <NavItem active={this.state.page === "#games"}>
                <NavLink href="#games" onClick={this.changePage}>Games</NavLink>
              </NavItem>
            </Nav>
          </Collapse>
        </Navbar>
        {page}
      </div>
    );
  }
}

export default App;