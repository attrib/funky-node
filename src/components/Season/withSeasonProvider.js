import React  from 'react'
import SeasonContext from './context'

const withSeasonProvider = Component => {
  class withSeasonProvider extends React.Component {

    constructor (props) {
      super(props)

      this.state = {
        selectedSeason: {
          id: 'nfgiPoF2rtTvBSD1IGVS',
          name: '2020',
        },
        changeSeason: this.onClick
      }
    }

    onClick = (selectedSeason) => {
      this.setState({selectedSeason})
    }

    render () {
      return (
        <SeasonContext.Provider value={this.state}>
          <Component {...this.props} />
        </SeasonContext.Provider>
      )
    }
  }

  return withSeasonProvider
}

export default withSeasonProvider