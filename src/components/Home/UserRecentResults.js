import React, { Component } from 'react'
import RecentResults from '../Results/RecentResults'
import SessionStore from "../../stores/SessionStore";

class UserRecentResults extends Component {
  render() {
    if (SessionStore.playerIds.length === 0) return (<p>No user linked to account</p>)
    else return (<RecentResults showGames filter={{player: SessionStore.playerIds}}/>)
  }
}

export default UserRecentResults