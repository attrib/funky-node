import React, { Component } from 'react'
import { withFirebase } from '../Firebase'
import { Button, Form } from 'reactstrap'
import Autosuggest from 'react-autosuggest';
import './LinkedPlayer.scss'

class LinkedPlayers extends Component {

  constructor (props) {
    super(props)

    this.state = {
      loading: false,
      players: Object.values(this.props.user.players),
      linkPlayer: '',
      suggestions: [],
    }
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

    this.props.firebase.playerSearch(inputValue)
      .then((snapshots) => {
        let suggestions = []
        snapshots.forEach((snapshot) => {
          suggestions.push({
            ...snapshot.data(),
            id: snapshot.id
          })
        })

        if (suggestions.length === 0) {
          suggestions = [
            { isAddNew: true }
          ];
        }

        this.setState({
          suggestions
        })
      });
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
    this.props.firebase.playerByName(this.state.linkPlayer)
      .then((player) => {
        this.props.firebase.player(player.id).set({
          userID: this.props.user.uid
        }, {merge: true})
          .then(() => {
            return this.props.firebase.user(this.props.user.uid).set({
              playerIDs: this.props.firebase.FieldValue.arrayUnion(player.id)
            }, {merge: true})
          })
          .then(() => {
            player.userID = this.props.user.uid
            const players = this.state.players
            players.push(player)
            this.setState({
              players,
              linkPlayer: ''
            })
          })
      })
  }

  unlinkPlayer = (id) => {
    this.props.firebase.player(id).set({
      userID: ''
    }, {merge: true})
      .then(() => {
        this.setState({
          players: this.state.players.filter((player) => player.id !== id)
        })
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
            <li key={player.id}>{ player.nick } <Button onClick={() => {this.unlinkPlayer(player.id)}}>Unlink</Button></li>
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

export default withFirebase(LinkedPlayers)