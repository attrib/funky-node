import React, { Component } from 'react'
import { Row, Col, Button, Form, Input, FormGroup, Alert } from 'reactstrap'
import MarkdownIt from 'markdown-it'
import * as ROUTES from '../../constants/routes'
import { withRouter } from 'react-router-dom'
import { compose } from 'recompose'
import { FormattedDate } from '../Utils/FormattedDate'
import SessionStore from "../../stores/SessionStore";
import BackendService from "../../services/BackendService";
const md = new MarkdownIt()

class NewsItem extends Component {
  constructor (props) {
    super(props)

    this.state = {
      error: null,
      id: false,
      edit: false,
      title: '',
      date: new Date(),
      content: '',
      markdown: '',
      ...this.props.news
    }
    this.newsService = new BackendService('news')
  }

  onChange = (event) => {
    let value = {}
    value[event.target.name] = event.target.value
    this.setState(value)
  }

  onEditToggle = () => {
    this.setState({
      edit: !this.state.edit
    })
  }

  onDelete = () => {
    this.newsService.delete(this.state.id)
      .then(() => this.props.history.push(`${ROUTES.LANDING}`))
      .catch((error) => this.setState({error: error.message}))
  }

  onSave = () => {
    const data = {
      title: this.state.title,
      markdown: this.state.markdown,
    }
    if (this.state.id) {
      this.newsService.patch(this.state.id, data)
        .then((news) => this.successSave(news))
        .catch((error) => this.setState({error}))
    }
    else {
      data.date = this.state.date
      this.newsService.post(data)
        .then((news) => this.successSave(news))
        .catch((error) => this.setState({error}))
    }
  }

  successSave = (news) => {
    this.setState({
      edit: false,
      ...news
    })
  }

  render() {
    const { title, date, content, markdown, edit, error } = this.state;
    let rows = markdown.split('\n').length + 2
    return (
      <Row className="news">
        <Col className="news-entry">
          <h2>{title}</h2>
          <div className="date"><FormattedDate date={date} /></div>
          {
            !edit && (
              <>
                <div dangerouslySetInnerHTML={{__html: content}}/>
                { SessionStore.isAdmin && <Button onClick={this.onEditToggle}>Edit</Button>}
              </>
            )
          }
          {
            edit && (
              <>
                <div dangerouslySetInnerHTML={{__html: md.render(markdown)}}/>
                <Form onSubmit={(event) => event.preventDefault()}>
                  <FormGroup>
                    <Input type="text" value={title} onChange={this.onChange} name="title" placeholder="Title"/>
                  </FormGroup>
                  <FormGroup>
                    <Input type="textarea" value={markdown} onChange={this.onChange} name="markdown" placeholder="Markdown" rows={rows}/>
                  </FormGroup>
                  { error && <Alert color="danger">{error}</Alert>}
                  <FormGroup>
                    { SessionStore.isAdmin && <Button color="danger" type="submit" onClick={this.onDelete}>Delete</Button> }
                    { SessionStore.isAdmin && <Button color="primary" type="submit" onClick={() => this.onSave()}>Save</Button> }
                  </FormGroup>
                </Form>
              </>
            )
          }
        </Col>
      </Row>
    )
  }

}

export default compose(
  withRouter
)(NewsItem)