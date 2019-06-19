import React from 'react'
import { GiTwoCoins } from 'react-icons/gi'

const Funkies = ({funkies}) => {
  funkies = funkies - 1
  const color = `rgb(${100 + funkies*-155}, ${100 + funkies*155}, 0)`
  if (funkies > 0) {
    funkies = '+' + funkies.toFixed(2)
  }
  else {
    funkies = funkies.toFixed(2)
  }
  return (
    <span style={{color, width: '4.5em', display: 'inline-block'}}>{ funkies } <GiTwoCoins style={{color: 'yellowgreen'}}/></span>
  )
}

export default Funkies