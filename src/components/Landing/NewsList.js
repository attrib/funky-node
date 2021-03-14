import React, { Component } from 'react'
import NewsItem from './NewsItem'
import { Button } from 'reactstrap'
import SessionStore from "../../stores/SessionStore";
import BackendService from "../../services/BackendService";

class NewsList extends Component {
  constructor (props) {
    super(props)

    this.state = {
      loading: false,
      news: [],
    }
    this.newsService = new BackendService('news')
  }

  componentDidMount () {
    this.setState({loading: true})

    this.newsService.get()
      .then((news) => {
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
        {SessionStore.isAdmin && <Button color="link" onClick={this.addEmptyNews}>Create News</Button>}
        {
          news.map(news => (
            <div key={news.id}>
              <NewsItem news={news}/>
              <hr/>
            </div>
          ))
        }
      </div>
    )
  }
}

export default NewsList