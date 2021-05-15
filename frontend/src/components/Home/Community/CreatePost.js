import React, { Component } from "react";
// import Tabs from 'react-bootstrap/Tabs';
import Tab from "react-bootstrap/Tab";
import { Button, Card, Col, Nav, Row } from "react-bootstrap";
import createPostRulesSVG from "../../../assets/createPostRules.svg";
import Axios from "axios";
import backendServer from "../../../webConfig";
import { getMongoUserID, getToken } from "../../../services/ControllerUtils";
import "./CreatePost.css";
import { Collapse, Fade } from "react-bootstrap";
import { Link, Redirect } from "react-router-dom";
import YoutubeSearchedForIcon from "@material-ui/icons/YoutubeSearchedFor";
class CreatePost extends Component {
  constructor(props) {
    super(props);
    this.state = {
      community_id: props.location.pathname
        ? this.props.location.pathname.replace("/createPost/", "")
        : "",
      type: "0",
      title: null,
      link: null,
      description: null,
      user_id: getMongoUserID(),
      redirectVar: null
    };
    console.log("PROPS AND STATE in create post", this.props, this.state);
  }

  uploadImage = e => {
    if (e.target.files && e.target.files.length > 0) {
      let data = new FormData();
      data.append("file", e.target.files[0]);
      this.props.setLoader();
      Axios.post(`${backendServer}/upload`, data)
        .then(response => {
          this.props.unsetLoader();
          console.log(response);
          if (response.data && response.data[0] && response.data[0].Location)
            this.setState({ postImageUrl: response.data[0].Location });
        })
        .catch(error => {
          this.props.unsetLoader();
          console.log("error " + error);
        });
    } else {
      this.setState({ postImageUrl: null });
    }
  };

  render() {
    const titleTag = (
      <input
        type="text"
        style={{ margin: "15px 0" }}
        className="form-control"
        placeholder="Title"
        id="title"
        name="post"
        value={this.state.title}
        onChange={e => {
          this.setState({ title: e.target.value });
        }}
      />
    );
    // const postButton = (
    //   <Button
    //     type="submit"
    //     style={{
    //       display: "block",
    //       float: "right",
    //       margin: "10px",
    //       width: "82px",
    //       borderRadius: "50px",
    //       backgroundColor: this.state.title ? "#0266b3" : "#777",
    //       color: "white",
    //       fontWeight: "500"
    //     }}
    //     variant="light"
    //   >
    //     Post
    //   </Button>
    // );
    return (
      <React.Fragment>
        {this.state.redirectVar}
        {/* inside CreatePost ... {this.props.content} */}
        <Row style={{ padding: "30px" }}>
          <Col sm={1}></Col>
          <Col sm={7}>
            <Link
              style={{
                color: "black",
                padding: "0 0 15px 0",
                display: "block",
                textAlign: "center"
              }}
              to={"/community/".concat(this.state.community_id)}
            >
              Back to community <YoutubeSearchedForIcon />
            </Link>

            <form
              onSubmit={e => {
                e.preventDefault();
                if (this.state.title) {
                  if (this.state.type == "2" && !this.state.postImageUrl) {
                    // alert("cant")
                    return;
                  }
                  this.props.setLoader();
                  Axios.defaults.headers.common["authorization"] = getToken();
                  Axios.post(backendServer + "/createPost", this.state)
                    .then(result => {
                      if (result.status == 200) {
                        this.setState({
                          redirectVar: (
                            <Redirect
                              to={{
                                pathname: `/community/${this.state.community_id}`
                              }}
                            />
                          )
                        });
                      }
                      this.props.unsetLoader();
                      console.log(result);
                    })
                    .catch(err => {
                      this.props.unsetLoader();
                      console.log(err);
                    });
                }
              }}
            >
              {/* {JSON.stringify(this.state)} */}
              <Tab.Container
                id="left-tabs-example"
                defaultActiveKey="0"
                onSelect={eventKey => {
                  this.setState({
                    type: eventKey,
                    title: "",
                    link: "",
                    description: ""
                  });
                  document.getElementById("description").value = "";
                  document.getElementById("title").value = "";
                  document.getElementById("link").value = "";
                }}
              >
                <Row>
                  <Row>
                    <Nav variant="tabs" className="flex-row">
                      <Nav.Item>
                        <Nav.Link className="navLinkV" eventKey="0">
                          <span className="tabElement">
                            <i
                              className="fa fa-comment-alt"
                              style={{ width: "15px", margin: "10px" }}
                            />
                            Post
                          </span>
                        </Nav.Link>
                      </Nav.Item>
                      <Nav.Item>
                        <Nav.Link className="navLinkV" eventKey="2">
                          <span className="tabElement">
                            <i
                              className="fa fa-image"
                              style={{ width: "15px", margin: "10px" }}
                            />
                            Images
                          </span>
                        </Nav.Link>
                      </Nav.Item>
                      <Nav.Item>
                        <Nav.Link className="navLinkV" eventKey="1">
                          <span className="tabElement">
                            <i
                              className="fa fa-link"
                              style={{ width: "15px", margin: "10px" }}
                            />
                            Link
                          </span>
                        </Nav.Link>
                      </Nav.Item>
                      <Nav.Item>
                        <Nav.Link className="navLinkV" ventKey="3" disabled>
                          <span
                            className="tabElement"
                            style={{ cursor: "not-allowed" }}
                          >
                            <i
                              className="fa fa-poll"
                              style={{ width: "15px", margin: "10px" }}
                            />
                            Poll
                          </span>
                        </Nav.Link>
                      </Nav.Item>
                    </Nav>
                  </Row>
                  <Row>
                    <Tab.Content>
                      <Tab.Pane eventKey="0">
                        {titleTag}
                        <input
                          type="text"
                          maxLength="180"
                          className="form-control"
                          placeholder="Text (optional)"
                          id="description"
                          name="description"
                          value={this.state.description}
                          onChange={e => {
                            this.setState({ description: e.target.value });
                          }}
                        />
                        <Button
                          type="submit"
                          style={{
                            display: "block",
                            float: "right",
                            margin: "10px",
                            width: "82px",
                            borderRadius: "50px",
                            backgroundColor: this.state.title ? "#0266b3" : "#777",
                            color: "white",
                            fontWeight: "500"
                          }}
                          variant="light" >
                          Post
                        </Button>
                      </Tab.Pane>
                      <Tab.Pane eventKey="2">
                        {titleTag}
                        <input
                          type="file"
                          className="form-control"
                          id="files"
                          name="files"
                          accept="image/*"
                          onChange={this.uploadImage}
                        ></input>
                        <Button
                          type="submit"
                          style={{
                            display: "block",
                            float: "right",
                            margin: "10px",
                            width: "82px",
                            borderRadius: "50px",
                            backgroundColor: this.state.title && this.state.postImageUrl ? "#0266b3" : "#777",
                            color: "white",
                            fontWeight: "500"
                          }}
                          variant="light"
                        >
                          Post
                          </Button>
                        <Row>
                          <img
                            src={this.state.postImageUrl}
                            alt=""
                            style={{
                              width: "60%",
                              margin: "auto",
                              padding: "10%"
                            }}
                          />
                        </Row>
                      </Tab.Pane>
                      <Tab.Pane eventKey="1">
                        {titleTag}
                        <input
                          type="url"
                          className="form-control"
                          placeholder="Url"
                          id="link"
                          name="link"
                          value={this.state.link}
                          required={this.state.type == "1"}
                          onChange={e => {
                            this.setState({ link: e.target.value });
                          }}
                        />
                        <Button
                          type="submit"
                          style={{
                            display: "block",
                            float: "right",
                            margin: "10px",
                            width: "82px",
                            borderRadius: "50px",
                            backgroundColor: this.state.title ? "#0266b3" : "#777",
                            color: "white",
                            fontWeight: "500"
                          }}
                          variant="light"
                        >
                          Post
      </Button>
                      </Tab.Pane>
                    </Tab.Content>
                  </Row>
                </Row>
              </Tab.Container>
            </form>
          </Col>
          <Col sm={3}>
            {this.props.location &&
              this.props.location.rules &&
              this.props.location.rules.length > 0 && (
                <Row>
                  <Card className="card">
                    <Card.Header className="cardHeader">
                      <img alt="" height="40px" src={createPostRulesSVG} /> r/
                      {this.props.location?.communityName}&apos;s Rules
                    </Card.Header>
                    <Card.Body>
                      {this.props.location.rules.map((rule, index) => {
                        var normalView = [],
                          expandedView = [];

                        if (index < 5) {
                          normalView.push(
                            <div key={rule._id}>
                              <strong>{rule.title}</strong>: {rule.description}
                            </div>
                          );
                        } else {
                          if (index == 5) {
                            normalView.push(
                              <div
                                className="upArrowRotate"
                                style={{
                                  display: !this.state.showMoreRules
                                    ? "block"
                                    : "none",
                                  textAlign: "center"
                                }}
                                onClick={() =>
                                  this.setState(state => ({
                                    showMoreRules: !state.showMoreRules
                                  }))
                                }
                              >
                                <i className="fa fa-angle-double-down" />
                              </div>
                            );
                          }
                          expandedView.push(
                            <div key={rule._id}>
                              <strong>{rule.title}</strong>: {rule.description}
                            </div>
                          );
                        }
                        return (
                          <div key="">
                            {normalView}
                            <Collapse in={this.state.showMoreRules}>
                              <Fade>
                                <div>
                                  {expandedView}
                                  {this.props.location.rules.length - 1 ==
                                    index ? (
                                    <div
                                      className="downArrowRotate"
                                      style={{
                                        display: this.state.showMoreRules
                                          ? "block"
                                          : "none",
                                        textAlign: "center"
                                      }}
                                      onClick={() =>
                                        this.setState(state => ({
                                          showMoreRules: !state.showMoreRules
                                        }))
                                      }
                                    >
                                      <i className="fa fa-angle-double-up" />
                                    </div>
                                  ) : (
                                    ""
                                  )}
                                </div>
                              </Fade>
                            </Collapse>
                          </div>
                        );
                      })}
                    </Card.Body>
                  </Card>
                </Row>
              )}

            <Row>
              <Card className="card">
                <Card.Header className="cardHeader">
                  <img alt="" height="40px" src={createPostRulesSVG} /> Posting
                  to Reddit
                </Card.Header>
                <Card.Body>
                  <ol>
                    <li>Remember the human</li>
                    <li>Behave like you would in real life</li>
                    <li>Look for the original source of content</li>
                    <li>Search for duplicates before posting</li>
                    <li>Read the community’s rules</li>
                  </ol>
                </Card.Body>
              </Card>
            </Row>
          </Col>
          <Col sm={1}></Col>
        </Row>
      </React.Fragment>
    );
  }
}

export default CreatePost;
