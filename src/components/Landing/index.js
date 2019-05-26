import React, { Component } from 'react';
import { Col, Container, Jumbotron, Row } from 'reactstrap'
import { withFirebase } from '../Firebase'
import './Landing.css';

class LandingPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      news: [],
    };
  }

  componentDidMount() {
    this.setState({ loading: true });

    this.props.firebase.news()
      .then(snapshot => {
        let news = [];
        snapshot.forEach(document => {
          news.push({
            ...document.data(),
            id: document.id,
          })
        })

        this.setState({
          news: news,
          loading: false,
        });
      })
      .catch(error => console.log(error));
  }

  render() {
    const { news, loading } = this.state;

    return (
      <div>
        <Jumbotron>
          <Container>
            <Row>
              <Col>
                <h1>Welcome to funky-clan 2019 edition</h1>
                <p>board and card game statistics for competitive gamers and statistic nerds</p>
              </Col>
            </Row>
          </Container>
        </Jumbotron>
        <Container>
          {loading && <div>Loading ...</div>}
          <NewsList news={news} />
        </Container>
      </div>
    )
  }
}

const NewsList = ({ news }) => (
  <Row className="news">
    {news.map(news => (
      <Col className="news-entry" key={news.id}>
        <h2>{news.Title}</h2>
        <div className="date">{new Intl.DateTimeFormat('de-DE', {year: 'numeric', month: 'long', day: '2-digit'}).format(news.Date.toDate())}</div>
        <div dangerouslySetInnerHTML={{__html: news.Content}} />
      </Col>
    ))}
  </Row>
);

export default withFirebase(LandingPage);