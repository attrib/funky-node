import { Link } from 'react-router-dom'
import * as ROUTES from '../../constants/routes'
import React from 'react'

const GameLink = ({game}) => {
  return (
    <Link to={{ pathname: ROUTES.GAME.replace(':id', game.id), state: {game}}}>{game.name}</Link>
  )
}

export default GameLink