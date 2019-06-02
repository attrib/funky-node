import React, { Component } from 'react'
import { withFirebase } from '../Firebase'
import AuthUserContext from '../Session/context'
import NewsItem from './NewsItem'
import { Button } from 'reactstrap'
import * as ROLES from '../../constants/roles'

class NewsList extends Component {
  constructor (props) {
    super(props)

    this.state = {
      loading: false,
      news: [],
    }
  }

  componentDidMount () {
    this.setState({loading: true})

    this.props.firebase.news()
      .then(snapshot => {
        let news = []
        snapshot.forEach(document => {
          const data = document.data()
          if (data.Content) {
            news.push({
              ...data,
              id: document.id,
            })
          }
        })

        this.setState({
          news: news,
          loading: false,
        })
      })
      .catch(error => console.log(error))
  }

  addEmptyNews = () => {
    const news = this.state.news;
    news.unshift({
      edit: true,
    })
    this.setState({
      news
    })
  }

  render () {
    const {news, loading} = this.state

    return (
      <div>
        {loading && <div>Loading ...</div>}
        <AuthUserContext.Consumer>
          {authUser =>
            (authUser && authUser.roles[ROLES.ADMIN] === ROLES.ADMIN) && <Button color="link" onClick={this.addEmptyNews}>Create News</Button>
          }
        </AuthUserContext.Consumer>
        {
          news.map(news => (
            <NewsItem news={news} key={news.id}/>
          ))
        }
      </div>
    )
  }
}

export default withFirebase(NewsList)