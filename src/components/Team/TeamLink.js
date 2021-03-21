import React from "react";
import SessionStore from "../../stores/SessionStore";
import * as ROUTES from "../../constants/routes";
import {Link} from "react-router-dom";
import PlayerNames from "../Player/PlayerNames";

const TeamLink = ({team}) => {
  if (!team || !team.players) {
    return (<span/>)
  }
  const authUserPlayerIds = SessionStore.playerIds
  // Link to player if its only a single player
  if (team.players.length === 1) {
    return <PlayerNames players={team.players} />
  }
  return (
    <Link to={{ pathname: ROUTES.TEAM.replace(':id', team.id), state: {team}}}>
      {  team.players.map((player, i) => (
        <span key={player.id}>
        { authUserPlayerIds.includes(player.id) && <strong>{player.nick}</strong>}
        { !authUserPlayerIds.includes(player.id) && player.nick}
        {i < team.players.length - 1 && ', '}
        </span>
        ))
      }
    </Link>
  )
}

export default TeamLink