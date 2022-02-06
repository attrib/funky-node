import { Link } from 'react-router-dom'
import * as ROUTES from '../../constants/routes'
import React from 'react'

const GameLink = ({game, title=game.name, className=""}) => {
  return (
    <Link className={className} to={{ pathname: ROUTES.GAME.replace(':id', game.id), state: {game}}}>{title}</Link>
  )
}

export default GameLink