import React, { Component } from 'react'
import { withFirebase } from '../Firebase'
import { Table, Container } from 'reactstrap'
import GameLink from '../Games/GameLink'
import { FormattedDateTime } from '../Utils/FormattedDate'
import LiveGameLink from './LiveGameLink'
import Score from '../Results/Score'
import AuthUserContext from '../Session/context'
import * as ROLES from '../../constants/roles'
import * as ROUTES from '../../constants/routes'
import { Link } from 'react-router-dom'

class LiveGames extends Component{

  constructor (props) {
    super(props)

    this.state = {
      loading: false,
      liveGames: null,
    }
  }

  componentDidMount () {
    if (!this.state.liveGames) {
      this.setState({loading: true})
      this.unsubscribe = this.props.firebase
        .liveGames((liveGames) => {
          this.setState({liveGames, loading: false})
        })
    }
  }

  componentWillUnmount () {
    this.unsubscribe()
  }

  render () {
    const { loading, liveGames } = this.state
    return (
      <div>
        <Container>
          { !loading && (
            <AuthUserContext.Consumer>
              {authUser => (
                (authUser && (authUser.roles[ROLES.ADMIN] === ROLES.ADMIN || authUser.roles[ROLES.APPROVED] === ROLES.APPROVED)) && <Link to={ROUTES.LIVE_GAME.replace(':id', 'new')}>Create live game</Link>
              )}
            </AuthUserContext.Consumer>
          )}
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

export default withFirebase(LiveGames)