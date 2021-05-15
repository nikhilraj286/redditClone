import React, { Component } from "react";
import axios from "axios";
import { Redirect } from "react-router-dom";
import {
  Dropdown,
  Col,
  Container,
  Row,
  Form,
  Button
  // ListGroup
} from "react-bootstrap";
import backendServer from "../../../webConfig";
import "./mycommunity.css";
import Chip from "@material-ui/core/Chip";
import Paper from "@material-ui/core/Paper";
import TextField from "@material-ui/core/TextField";
import { getMongoUserID, getToken } from "../../../services/ControllerUtils";

class CreateCommunity extends Component {
  constructor(props) {
    super(props);
    this.state = {
      communityName: "",
      error: "",
      communityImages: [],
      uploadedImage: [],
      listOfTopics: [],
      selectedTopic: [],
      communityDescription: "",
      listOfRule: [],
      title: "",
      rulesDescription: "",
      addEditButton: "Add Rule",
      editRule: {},
      communityID: ""
    };
  }

  OnImageUpload = e => {
    e.preventDefault();
    let data = new FormData();
    if (this.state.communityImages.length == 0) {
      this.setState({
        error: "No files selected to upload"
      });
      return;
    }
    this.state.communityImages.map(commImage => {
      data.append("file", commImage);
    });
    this.props.setLoader();
    axios
      .post(`${backendServer}/upload`, data)
      .then(response => {
        this.props.unsetLoader();
        const images = this.state.uploadedImage;
        console.log(response.data);
        response.data.map(data => {
          images.push({ url: data.Location });
        });
        this.setState({
          uploadedImage: images,
          communityImages: []
        });
        console.log(images);
      })
      .catch(error => {
        this.props.unsetLoader();
        console.log("error " + error);
      });
  };

  createCommunity(data) {
    axios.defaults.headers.common["authorization"] = getToken();
    axios
      .post(`${backendServer}/addCommunity`, data)
      .then(response => {
        this.props.unsetLoader();
        if (response.status == 200) {
          this.setState({ error: "" });
          this.setState({
            redirectVar: (
              <Redirect
                to={{
                  pathname: `/community/${response.data._id}`
                }}
              />
            )
          });
        }
      })
      .catch(error => {
        this.props.unsetLoader();
        this.setState({
          error: "Community name is not unique"
        });
        console.log("error " + error);
      });
  }

  editCommunity(data) {
    axios.defaults.headers.common["authorization"] = getToken();
    data.ID = this.state.communityID;
    axios
      .post(`${backendServer}/editCommunity`, data)
      .then(response => {
        this.props.unsetLoader();
        if (response.status == 200) {
          this.setState({ error: "" });
          this.setState({
            redirectVar: (
              <Redirect
                to={{
                  pathname: `/community/${this.state.communityID}`
                }}
              />
            )
          });
        }
      })
      .catch(error => {
        console.log(error);
        this.props.unsetLoader();
        this.setState({
          error: "Community name is not unique"
        });
      });
  }

  handleSubmit = e => {
    e.preventDefault();
    const ownerID = getMongoUserID();
    const data = {
      ownerID: ownerID,
      communityName: this.state.communityName,
      communityDescription: this.state.communityDescription,
      communityImages: this.state.uploadedImage,
      selectedTopic: this.state.selectedTopic,
      listOfRules: this.state.listOfRule
    };
    this.props.setLoader();
    if (this.state.communityID == "") {
      this.createCommunity(data);
    } else {
      this.editCommunity(data);
    }
  };

  componentDidMount() {
    const query = new URLSearchParams(this.props.location.search);
    const communityName = this.props.location.pathname
      ? this.props.location.pathname.replace("/createCommunity/", "")
      : "";
    const id = query.get("id");
    if (id != null) {
      this.setState({ communityID: id });
      this.getCommunityDataToEdit(id);
    } else {
      this.setState({ communityName });
    }
    this.getTopicFromDB();
  }

  async getCommunityDataToEdit(id) {
    axios.defaults.headers.common["authorization"] = getToken();
    await axios
      .get(`${backendServer}/getCommunityDetails?ID=${id}`)
      .then(response => {
        this.setState({
          communityName: response.data.communityName,
          uploadedImage: response.data.imageURL,
          selectedTopic: response.data.topicSelected,
          communityDescription: response.data.communityDescription,
          listOfRule: response.data.rules
        });
      })
      .catch(error => {
        this.setState({
          error: error
        });
      });
  }

  async getTopicFromDB() {
    axios.defaults.headers.common["authorization"] = getToken();
    await axios
      .get(`${backendServer}/getTopic`)
      .then(response => {
        this.setState({
          listOfTopics: response.data
        });
      })
      .catch(error => {
        this.setState({
          error: error
        });
      });
  }

  handleTopicSelection = topic => {
    const findTopic = this.state.selectedTopic.find(
      x => x.topic_id == topic.topic_id
    );
    if (typeof findTopic == "undefined") {
      this.setState(prevState => ({
        selectedTopic: [
          ...prevState.selectedTopic,
          {
            topic: topic.topic,
            topic_id: topic.topic_id
          }
        ]
      }));
    }

    console.log(this.state.selectedTopic);
  };
  handleAddRule = e => {
    e.preventDefault();
    if (Object.keys(this.state.editRule).length > 0) {
      let items = this.state.listOfRule;
      items.splice(items.indexOf(this.state.editRule), 1);
      this.setState({
        listOfRule: items
      });
    }
    this.setState(prevState => ({
      listOfRule: [
        ...prevState.listOfRule,
        {
          title: this.state.title,
          description: this.state.rulesDescription
        }
      ],
      rulesDescription: "",
      title: "",
      addEditButton: "Add Rule"
    }));
  };

  handleDelete = (e, topic) => {
    e.preventDefault();
    let items = this.state.selectedTopic;
    items.splice(items.indexOf(topic), 1);
    this.setState({
      selectedTopic: items
    });
  };

  handleRuleDelete = (e, rule) => {
    e.preventDefault();
    let items = this.state.listOfRule;
    items.splice(items.indexOf(rule), 1);
    this.setState({
      listOfRule: items
    });
  };

  handleEditRules = (e, rule) => {
    e.preventDefault();

    this.setState({
      editRule: rule,
      title: rule.title,
      rulesDescription: rule.description,
      addEditButton: "Update Rule"
    });
  };

  uploadMultipleFiles = e => {
    console.log(e.target.files);
    let communityImage = this.state.communityImages;
    Array.prototype.forEach.call(e.target.files, function (file) {
      communityImage.push(file);
    });
    this.setState({
      communityImages: communityImage,
      error: ""
    });
  };

  render() {
    let dropDownItem = null;
    let selectedTopic = null;
    let rules = null;
    let imageUpload = null;
    if (this.state.uploadedImage.length > 0) {
      imageUpload = this.state.uploadedImage.map((image, idx) => {
        console.log(image.url);
        return (
          <img width={80} height={60} key={idx} src={image.url} alt="..." />
        );
      });
    }
    if (this.state.listOfTopics != null && this.state.listOfTopics.length > 0) {
      dropDownItem = this.state.listOfTopics.map(topic => {
        return (
          <Dropdown.Item
            key={topic.topic_id}
            onClick={() => this.handleTopicSelection(topic)}
          >
            {topic.topic}
          </Dropdown.Item>
        );
      });
      if (this.state.selectedTopic.length > 0) {
        selectedTopic = this.state.selectedTopic.map(topic => {
          return (
            <Chip
              key={topic.topic_id}
              label={topic.topic}
              onDelete={e => this.handleDelete(e, topic)}
              className="chip"
            />
          );
        });
      }

      if (this.state.listOfRule.length > 0) {
        rules = this.state.listOfRule.map((rule, idx) => {
          return (
            <Row key={idx}>
              <Col xs={2}>
                <strong>{rule.title}</strong>
              </Col>
              <Col xs={7}>{rule.description}</Col>
              <Col xs={3}>
                <button
                  className="btn"
                  style={{
                    color: this.props.darkMode ? "#DAE0E6" : "black"
                  }}
                  onClick={e => this.handleEditRules(e, rule)}
                >
                  <i className="fa fa-pencil" aria-hidden="true"></i>
                </button>
                <button
                  className="btn"
                  onClick={e => this.handleRuleDelete(e, rule)}
                >
                  <i
                    className="fa fa-trash"
                    style={{
                      color: this.props.darkMode ? "#DAE0E6" : "black"
                    }}
                    aria-hidden="true"
                  ></i>
                </button>
              </Col>
            </Row>
          );
        });
      }
    }
    return (
      <React.Fragment>
        <Container fluid>
          {this.state.redirectVar}
          <Row>
            <Col xs={1}>
              <img
                className="reddit-login"
                alt="Create Community"
                src="https://www.redditstatic.com/desktop2x/img/partner-connection.png"
              />
            </Col>
            <Col
              xs={5}
              style={{ padding: "50px", borderRight: "1px solid #ddd" }}
            >
              <Form onSubmit={this.handleSubmit} className="form-stacked">
                <div
                  id="errorLogin"
                  hidden={this.state.error != "" ? false : true}
                  className="alert alert-danger"
                  role="alert"
                >
                  {this.state.error}
                </div>
                <Form.Label>
                  <b>
                    {this.state.communityID != ""
                      ? "Edit a Community"
                      : "Create a Community"}
                  </b>
                </Form.Label>
                <Form.Group>
                  <Form.Label className="community-label" htmlFor="name">
                    Name<sup>*</sup>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    id="name"
                    name="name"
                    maxLength="50"
                    onKeyDown={evt => evt.key === " " && evt.preventDefault()}
                    value={this.state.communityName}
                    onChange={e =>
                      this.setState({ communityName: e.target.value })
                    }
                    aria-describedby="passwordHelpBlock"
                    required
                  ></Form.Control>
                  <Form.Text id="passwordHelpBlock" muted>
                    Community names including capitialization cannot be changed.
                  </Form.Text>
                </Form.Group>
                <Form.Group>
                  <Form.Label className="community-label" htmlFor="topics">
                    Topics
                  </Form.Label>
                  <Dropdown>
                    <Dropdown.Toggle>Select topic</Dropdown.Toggle>
                    <Dropdown.Menu>{dropDownItem}</Dropdown.Menu>
                  </Dropdown>
                  <Paper component="ul" className="root">
                    {selectedTopic}
                  </Paper>
                </Form.Group>
                <Form.Group>
                  <Form.Label htmlFor="description" className="community-label">
                    Description<sup>*</sup>
                  </Form.Label>
                  <Form.Control
                    data-testid="email-input-box"
                    type="textarea"
                    id="description"
                    name="description"
                    value={this.state.communityDescription}
                    onChange={e =>
                      this.setState({ communityDescription: e.target.value })
                    }
                    required
                  ></Form.Control>
                </Form.Group>
                <Form.Group>
                  <Form.Control
                    className="form-control"
                    type="file"
                    id="image"
                    name="image"
                    multiple
                    onChange={this.uploadMultipleFiles}
                  ></Form.Control>
                  <Button type="btn" onClick={this.OnImageUpload}>
                    Upload
                  </Button>
                  <div className="form-group multi-preview">{imageUpload}</div>
                </Form.Group>
                <Form.Group className="text-center">
                  <Button
                    type="submit"
                    className="createCommunity"
                    color="btn btn-primary"
                  >
                    {this.state.communityID == ""
                      ? " Create Community"
                      : " Edit Community"}
                  </Button>
                </Form.Group>
              </Form>
            </Col>
            <Col xs={5} className="rulesForm">
              <Form.Group>
                <Form.Label
                  className="community-label"
                  htmlFor="Rules"
                  style={{ fontWeight: "bold" }}
                >
                  Rules
                </Form.Label>
                <br />
                <Form onSubmit={this.handleAddRule}>
                  <TextField
                    className="rulesTextbox"
                    id="outlined-basic"
                    label="Title"
                    variant="outlined"
                    maxLength="50"
                    value={this.state.title}
                    required
                    onChange={e => this.setState({ title: e.target.value })}
                  />

                  <TextField
                    style={{
                      width: "300px",
                      marginLeft: "5px"
                    }}
                    className="rulesTextbox"
                    id="outlined-basic"
                    label="Description"
                    variant="outlined"
                    value={this.state.rulesDescription}
                    required
                    onChange={e =>
                      this.setState({ rulesDescription: e.target.value })
                    }
                  />
                  <Button
                    type="submit"
                    style={{ marginTop: "10px" }}
                    className="createCommunity"
                    color="btn btn-primary"
                  >
                    {this.state.addEditButton}
                  </Button>
                </Form>
              </Form.Group>
              <Form.Group>
                <Form.Label>
                  <strong>List of Rules</strong>
                </Form.Label>
                {rules}
              </Form.Group>
            </Col>
          </Row>
        </Container>
      </React.Fragment>
    );
  }
}

// const mapStateToProps = state => {
//   return {
//     listOfTopic: state.community.listOfTopic
//   };
// };
export default CreateCommunity;
// export default connect(mapStateToProps, {
//   getTopicFromDB
// })(CreateCommunity);
