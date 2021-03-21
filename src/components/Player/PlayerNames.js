import { Link } from 'react-router-dom'
import * as ROUTES from '../../constants/routes'
import React from 'react'
import SessionStore from "../../stores/SessionStore";

const PlayerNames = ({players}) => {
  if (!players) {
    return (<span/>)
  }
  const authUserPlayerIds = SessionStore.playerIds
  return players.map((player, i) => (
    <span key={player.id}>
      { authUserPlayerIds.includes(player.id) && <strong><PlayerLink player={player}/></strong>}
      { !authUserPlayerIds.includes(player.id) && <PlayerLink player={player}/>}
      {i < players.length - 1 && ', '}
    </span>
  ))
}

const PlayerLink = ({player}) => {
  return (
    <Link to={{ pathname: ROUTES.PLAYER.replace(':id', player.id), state: {player}}}>{player.nick}</Link>
  )
}

export default PlayerNames