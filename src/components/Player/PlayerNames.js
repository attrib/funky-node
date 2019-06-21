import AuthUserContext from '../Session/context'
import { Link } from 'react-router-dom'
import * as ROUTES from '../../constants/routes'
import React from 'react'

const PlayerNames = ({players}) => {
  return players.map((player, i) => (
    <AuthUserContext.Consumer key={player.nick}>
      {authUser => (
        <>
          { (authUser && player.id in authUser.players) && <strong><PlayerLink player={player}/></strong>}
          { (!authUser || !(player.id in authUser.players)) && <PlayerLink player={player}/>}
          {i < players.length - 1 && ', '}
        </>
      )}
    </AuthUserContext.Consumer>
  ))
}

const PlayerLink = ({player}) => {
  return (
    <Link to={{ pathname: ROUTES.PLAYER.replace(':id', player.id), state: {player}}}>{player.nick}</Link>
  )
}

export default PlayerNames