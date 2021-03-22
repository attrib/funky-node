import React, { Component } from 'react'
import { Table, Container } from 'reactstrap'
import GameLink from '../Games/GameLink'
import { FormattedDateTime } from '../Utils/FormattedDate'
import LiveGameLink from './LiveGameLink'
import Score from '../Results/Score'
import * as ROUTES from '../../constants/routes'
import { Link } from 'react-router-dom'
import SessionStore from "../../stores/SessionStore";
import {io} from 'socket.io-client'

class LiveGames extends Component{

  constructor (props) {
    super(props)

    this.state = {
      loading: true,
      liveGames: null,
    }
  }

  componentDidMount () {
    if (!this.state.liveGames) {
      this.setState({loading: true})
    }
    const url = new URL(process.env.REACT_APP_BACKEND_URL)
    this.socket = io(`ws://${url.host}`);

    this.socket.on('livegames', (liveGames) => {
      console.log(liveGames);
      this.setState({liveGames, loading: false})
    });

    this.socket.on('new', (liveGame) => {
      const liveGames = this.state.liveGames
      liveGames.push(liveGame)
      this.setState({liveGames})
    });

    this.socket.on('update', (liveGame) => {
      const liveGames = this.state.liveGames.map((game) => {
        if (game.id === liveGame.id) {
          return liveGame
        }
        return game
      })
      this.setState({liveGames})
    });

    this.socket.on('delete', (id) => {
      const liveGames = this.state.liveGames.filter((game) => id !== game.id)
      this.setState({liveGames})
    })

  }

  componentWillUnmount () {
    this.socket.close()
  }

  render () {
    const { loading, liveGames } = this.state
    console.log(liveGames)
    return (
      <div>
        <Container>
          { (SessionStore.isApproved) && <Link to={ROUTES.LIVE_GAME.replace(':id', 'new')}>Create live game</Link> }
          { loading && <div>Loading..</div>}
          { (!loading && (!liveGames || liveGames.length === 0)) && <div>No running live games</div> }
          { (!loading && liveGames && liveGames.length > 0) && (
            <Table>
              <thead>
                <tr>
                  <th>Game</th>
                  <th>Lead</th>
                  <th>Score</th>
                  <th colSpan={2}>Last Updated</th>
                </tr>
              </thead>
              <tbody>
              {liveGames.map((liveGame) => (
                <tr key={liveGame.id}>
                  <td><GameLink game={liveGame.game} /></td>
                  <td><Score result={liveGame} winners/></td>
                  <td><Score result={liveGame} losers/></td>
                  <td><FormattedDateTime date={liveGame.lastUpdatedDate} /></td>
                  <td><LiveGameLink liveGame={liveGame} linkName="Details" /></td>
                </tr>
              ))}
              </tbody>
            </Table>
          )}
        </Container>
      </div>
    )
  }

}

export default LiveGames