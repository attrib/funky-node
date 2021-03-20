import React, { Component } from 'react'
import { Button, Form } from 'reactstrap'
import Autosuggest from 'react-autosuggest';
import './LinkedPlayer.scss'
import BackendService from "../../services/BackendService";
import SessionStore from "../../stores/SessionStore";

class LinkedPlayers extends Component {

  constructor (props) {
    super(props)

    this.state = {
      loading: false,
      players: this.props.user.players,
      linkPlayer: '',
      suggestions: [],
    }
    this.playerService = new BackendService('player')
    this.userService = new BackendService('user')
  }

  componentDidMount () {
    // if (this.state.players) {
    //   return
    // }
    // console.log(this.props.user)
    // this.setState({
    //   players: Object.values(this.props.user.players),
    //   loading: false,
    // })
  }

  onChange = (event, { newValue }) => {
    this.setState({
      [event.target.name]: newValue
    })
  }

  // Autosuggest will call this function every time you need to update suggestions.
  // You already implemented this logic above, so just use it.
  onSuggestionsFetchRequested = ({ value }) => {
    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;

    if (inputLength <= 2) {
      this.setState({
        suggestions: []
      });
      return
    }

    this.playerService.get({search: inputValue})
      .then((suggestions) => {
        this.setState({
          suggestions
        })
      })
  };

  // Autosuggest will call this function every time you need to clear suggestions.
  onSuggestionsClearRequested = () => {
    this.setState({
      suggestions: []
    });
  };

  renderSuggestion = suggestion => {
    if (suggestion.isAddNew) {
      return (
        <span>
          [+] Add new: <strong>{this.state.linkPlayer}</strong>
        </span>
      );
    }

    return suggestion.nick;
  };

  onSuggestionSelected = (event, { suggestion }) => {
    if (!suggestion.isAddNew) {
      this.setState({
        linkPlayer: suggestion.nick
      })
    }
  }

  getSuggestionValue = suggestion => {
    if (suggestion.isAddNew) {
      return this.state.linkPlayer
    }

    return suggestion.nick
  }

  linkPlayer = () => {
    this.userService.patch(this.props.user.id, {players: [{nick: this.state.linkPlayer}]})
      .then((user) => {
        SessionStore.refreshUser(user)
        this.setState({
          players: user.players,
          linkPlayer: ''
        })
      })
      .catch((error) => {
        console.log(error)
      })
  }

  unlinkPlayer = (nick) => {
    this.userService.patch(this.props.user.id, {deleteLinkedPlayer: nick})
      .then((user) => {
        SessionStore.refreshUser(user)
        this.setState({
          players: user.players,
        })
      })
      .catch((error) => {
        console.log(error)
      })
  }

  render () {
    const { players, loading, linkPlayer, suggestions } = this.state

    const inputProps = {
      placeholder: "Link Player",
      value: linkPlayer,
      name: 'linkPlayer',
      onChange: this.onChange
    };

    return (<div>
      <h2>Linked Players</h2>
      { (!players && !loading) && <p>No linked players to this user account</p> }
      {  players && (
        <ul>
          { players.map((player) => (
            <li key={player.id}>{ player.nick } <Button onClick={() => {this.unlinkPlayer(player.nick)}}>Unlink</Button></li>
          ))}
        </ul>
      )}
      <Form onSubmit={(event) => event.preventDefault()}>
        <Autosuggest
          suggestions={suggestions}
          onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
          onSuggestionsClearRequested={this.onSuggestionsClearRequested}
          getSuggestionValue={this.getSuggestionValue}
          renderSuggestion={this.renderSuggestion}
          onSuggestionSelected={this.onSuggestionSelected}
          inputProps={inputProps}
        />
        <Button onClick={this.linkPlayer}>Link Player</Button>
      </Form>
    </div>)
  }

}

export default LinkedPlayers