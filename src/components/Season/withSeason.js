import React from 'react'

import SeasonContext from './context'
import { Alert, Container } from 'reactstrap'
export const withSeason = Component => props => (
  <SeasonContext.Consumer>
    {
      (season) => (
       season ? <Component {...props} seasonPrefix={season.selectedSeason.id !== 'all' ? 'season/' + season.selectedSeason.id : ''} selectedSeason={season.selectedSeason} changeSeason={season.changeSeason} /> : (<div>
         <Container>
           <Alert color='danger'>Select a valid season</Alert>
         </Container>
       </div>)
     )
    }
  </SeasonContext.Consumer>
)

export default withSeason