import React, { Component } from 'react'
import { Table, Container } from 'reactstrap'
import GameLink from '../Games/GameLink'
import { FormattedDateTime } from '../Utils/FormattedDate'
import LiveGameLink from './LiveGameLink'
import Score from '../Results/Score'
import * as ROUTES from '../../constants/routes'
import { Link } from 'react-router-dom'
import SessionStore from "../../stores/SessionStore";
import LiveGamesStore from "../../stores/LiveGamesStore";
import {observer} from "mobx-react";
import {toJS} from "mobx";

class LiveGames extends Component{

  render () {
    const liveGames = LiveGamesStore.liveGamesArray
    return (
      <div>
        <Container>
          { (SessionStore.isApproved) && <Link to={ROUTES.LIVE_GAME.replace(':id', 'new')}>Create live game</Link> }
          { (!liveGames || liveGames.length === 0) && <div>No running live games</div> }
          { (liveGames && liveGames.length > 0) && (
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
                  <td><GameLink game={toJS(liveGame.game)} /></td>
                  <td><Score result={toJS(liveGame)} winners/></td>
                  <td><Score result={toJS(liveGame)} losers/></td>
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

export default observer(LiveGames)