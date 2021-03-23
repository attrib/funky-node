import { Link } from 'react-router-dom'
import * as ROUTES from '../../constants/routes'
import React from 'react'

const LiveGameLink = ({liveGame, linkName}) => {
  return (
    <Link to={{ pathname: ROUTES.LIVE_GAME.replace(':id', liveGame.id)}}>{linkName}</Link>
  )
}

export default LiveGameLink