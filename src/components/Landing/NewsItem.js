import React, { Component } from 'react'
import { Row, Col, Button, Form, Input, FormGroup, Alert } from 'reactstrap'
import MarkdownIt from 'markdown-it'
import * as ROUTES from '../../constants/routes'
import { withRouter } from 'react-router-dom'
import { compose } from 'recompose'
import { FormattedDate } from '../Utils/FormattedDate'
import SessionStore from "../../stores/SessionStore";
const md = new MarkdownIt()

class NewsItem extends Component {
  constructor (props) {
    super(props)

    this.state = {
      error: null,
      id: false,
      edit: false,
      Title: '',
      Date: props.firebase.getCurrentDate(),
      Content: '',
      Markdown: '',
      ...this.props.news
    }
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
    this.props.firebase.newsItem(this.state.id).delete()
      .then(() => this.props.history.push(`${ROUTES.LANDING}`))
      .catch((error) => this.setState({error: error.message}))
  }

  onSave = (authUser) => {
    if (this.state.id) {
      this.props.firebase.newsItem(this.state.id).set({
        Title: this.state.Title,
        Markdown: this.state.Markdown,
      }, { merge: true })
        .then(() => this.successSave(authUser))
        .catch((error) => this.setState({error: error.message}))
    }
    else {
      this.props.firebase.newsAdd({
        Title: this.state.Title,
        Markdown: this.state.Markdown,
        Date: this.state.Date,
        authorID: authUser.uid
      })
        .then(() => this.successSave(authUser))
        .catch((error) => this.setState({error: error.message}))
    }
  }

  successSave = (authUser) => {
    this.setState({
      authorID: authUser.uid,
      edit: false,
      Content: md.render(this.state.Markdown)
    })
  }

  render() {
    const { Title, Date, Content, Markdown, edit, error, authorID } = this.state;
    const authUser = SessionStore.user
    let rows = Markdown.split('\n').length + 2
    return (
      <Row className="news">
        <Col className="news-entry">
          <h2>{Title}</h2>
          <div className="date"><FormattedDate date={Date} /></div>
          {
            !edit && (
              <>
                <div dangerouslySetInnerHTML={{__html: Content}}/>
                { authUser && authUser.uid === authorID && <Button onClick={this.onEditToggle}>Edit</Button>}
              </>
            )
          }
          {
            edit && (
              <>
                <div dangerouslySetInnerHTML={{__html: md.render(Markdown)}}/>
                <Form onSubmit={(event) => event.preventDefault()}>
                  <FormGroup>
                    <Input type="text" value={Title} onChange={this.onChange} name="Title" placeholder="Title"/>
                  </FormGroup>
                  <FormGroup>
                    <Input type="textarea" value={Markdown} onChange={this.onChange} name="Markdown" placeholder="Markdown" rows={rows}/>
                  </FormGroup>
                  { error && <Alert color="danger">{error}</Alert>}
                  <FormGroup>
                    { authUser && this.state.id && authUser.uid === authorID && <Button color="danger" type="submit" onClick={this.onDelete}>Delete</Button> }
                    { authUser && <Button color="primary" type="submit" onClick={() => this.onSave(authUser)}>Save</Button> }
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