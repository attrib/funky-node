import React, { Component } from 'react'
import { DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown } from 'reactstrap'
import { withFirebase } from '../Firebase'
import withSeason from './withSeason'

class SeasonSelector extends Component {

  constructor (props) {
    super(props);

    this.state = {
      loading: false,
      seasons: null,
    }
  }

  componentDidMount () {
    if (this.state.seasonPrefix) {
      return
    }
    this.setState({loading: true})
    this.props.firebase.seasons().then((seasons) => {
      this.setState({
        loading: false,
        seasons: seasons
      })
    })
  }

  render () {
    const {loading, seasons} = this.state
    const {selectedSeason, changeSeason} = this.props

    return (
      <UncontrolledDropdown nav inNavbar>
        <DropdownToggle nav caret>
          Season {selectedSeason.name}
        </DropdownToggle>
        {
          (!loading && seasons) &&
          <DropdownMenu right>
            { seasons.map((season) => (
              <DropdownItem key={season.id} active={selectedSeason.id === season.id} onClick={() => changeSeason(season)}>
                Season {season.name}
              </DropdownItem>
            )) }
            <DropdownItem divider />
            <DropdownItem active={selectedSeason.id === 'all'} onClick={() => changeSeason({id: 'all', name: 'Overall'})}>
              Overall
            </DropdownItem>
          </DropdownMenu>
        }
      </UncontrolledDropdown>
    )
  }

}

export default withFirebase(withSeason(SeasonSelector))