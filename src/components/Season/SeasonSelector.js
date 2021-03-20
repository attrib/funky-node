import React, { Component } from 'react'
import { DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown } from 'reactstrap'
import BackendService from "../../services/BackendService";
import SeasonStore from "../../stores/SeasonStore";
import {observer} from "mobx-react";

class SeasonSelector extends Component {

  constructor (props) {
    super(props);

    this.state = {
      loading: false,
      seasons: null,
    }
    this.tagsService = new BackendService('tag');
  }

  componentDidMount () {
    this.setState({loading: true})
    this.tagsService.get().then((seasons) => {
      this.setState({
        loading: false,
        seasons: seasons
      })
      if (!SeasonStore.selectedSeason.id) {
        SeasonStore.changeSeason(seasons[seasons.length - 1]);
      }
    })
  }

  render () {
    const {loading, seasons} = this.state
    const selectedSeason = SeasonStore.selectedSeason

    return (
      <UncontrolledDropdown nav inNavbar>
        <DropdownToggle nav caret>
          Season {selectedSeason.name}
        </DropdownToggle>
        {
          (!loading && seasons) &&
          <DropdownMenu right>
            { seasons.map((season) => (
              <DropdownItem key={season.id} active={selectedSeason.id === season.id} onClick={() => SeasonStore.changeSeason(season)}>
                Season {season.name}
              </DropdownItem>
            )) }
            <DropdownItem divider />
            <DropdownItem active={selectedSeason.id === 'all'} onClick={() => SeasonStore.changeSeason({id: 'all', name: 'Overall'})}>
              Overall
            </DropdownItem>
          </DropdownMenu>
        }
      </UncontrolledDropdown>
    )
  }

}

export default observer(SeasonSelector)