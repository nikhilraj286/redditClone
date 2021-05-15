import React, { Component } from "react";
import axios from "axios";
import { Row, Col, Card } from "react-bootstrap";
import { Link } from "react-router-dom";

import {
  getRelativeTime,
  getToken,
  nFormatter,
  getMongoUserID,
} from "../../../services/ControllerUtils";
import backendServer from "../../../webConfig";
import DefaultCardText from "../../../assets/NoImage.png";

class User extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: false,
      communities: [],
    };
  }
  componentDidMount() {
    this.loadUserData();
  }
  componentDidUpdate(prevProps) {
    if (prevProps.location.pathname !== this.props.location.pathname) {
      this.loadUserData();
    }
  }
  loadUserData = async () => {
    try {
      const { pathname } = this.props.location;
      const user_id = pathname.split("/");

      this.props.setLoader();
      axios.defaults.headers.common["authorization"] = getToken();
      const {
        data: { user, user_communities },
      } = await axios.get(
        backendServer +
        "/getUserDetails/" +
        (this.props.match.params.user_id || user_id[user_id.length - 1])
      );
      this.props.unsetLoader();
      this.setState({
        user,
        communities: user_communities,
      });
    } catch (e) {
      console.log(e);
    }
  };
  // vote = async ({ community_id, voting }) => {
  //     try {
  //         axios.defaults.headers.common["authorization"] = getToken();
  //         const { data: { community } } = await axios.post(`${backendServer}/community/vote/${community_id}`, {
  //           "voting": Number(voting)
  //         });
  //         if(!community) { return; }
  //         const { communities } = this.state;

  //         let temp = communities.reduce((acc, it) => {
  //           acc[it._id] = it;
  //           return acc;
  //         }, {});

  //         temp[community._id].upVotedLength = community.upvotedBy.length;
  //         temp[community._id].downVotedLength = community.downvotedBy.length;

  //         this.setState({
  //           communities: Object.values(temp)
  //         });
  //       } catch (e) { console.log(e) }
  // }
  upVote = (communityId, userVoteDir, index) => {
    var relScore = userVoteDir == 1 ? -1 : userVoteDir == 0 ? 1 : 2;
    console.log("upvote req  = ", communityId, " ", userVoteDir, " ", index);
    axios.defaults.headers.common["authorization"] = getToken();
    axios
      .post(backendServer + "/addVote", {
        entityId: communityId,
        userId: getMongoUserID(),
        voteDir: userVoteDir == 1 ? 0 : 1,
        relScore: relScore,
        entityName: "Community",
      })
      .then((response) => {
        // this.props.unsetLoader();
        console.log("upVOted successfull = ", response);
        console.log("this.state = ", this.state);
        console.log("this.state = ", this.state.communities[index].userVoteDir);
        const newCommunities = this.state.communities.slice();
        newCommunities[index].score =
          userVoteDir == 1
            ? newCommunities[index].score - 1
            : userVoteDir == 0
              ? newCommunities[index].score + 1
              : newCommunities[index].score + 2;

        newCommunities[index].userVoteDir = userVoteDir == 1 ? 0 : 1;
        console.log("newCommunities = ", newCommunities);
        this.setState({ communities: newCommunities });
        // this.fetchCommentsWithPostID();
      })
      .catch((err) => {
        // this.props.unsetLoader();
        console.log(err);
      });
  };

  downVote = (postId, userVoteDir, index) => {
    // const oldScore = 0;
    var relScore = userVoteDir == -1 ? 1 : userVoteDir == 0 ? -1 : -2;
    axios.defaults.headers.common["authorization"] = getToken();
    axios
      .post(backendServer + "/addVote", {
        entityId: postId,
        userId: getMongoUserID(),
        voteDir: userVoteDir == -1 ? 0 : -1,
        relScore: relScore,
        entityName: "Community",
      })
      .then((response) => {
        // this.props.unsetLoader();
        console.log("downvoted successfull = ", response);
        console.log("communities = ", this.state.communities);
        const newCommunities = this.state.communities.slice();
        newCommunities[index].score =
          userVoteDir == -1
            ? newCommunities[index].score + 1
            : userVoteDir == 0
              ? newCommunities[index].score - 1
              : newCommunities[index].score - 2;

        // newComments[index].userVoteDir = response.data.userVoteDir;
        newCommunities[index].userVoteDir = userVoteDir == -1 ? 0 : -1;
        console.log("newCommunities = ", newCommunities);
        this.setState({ communities: newCommunities });
        // this.fetchCommentsWithPostID();
      })
      .catch((err) => {
        // this.props.unsetLoader();
        console.log(err);
      });
  };
  render() {
    const { user, communities } = this.state;
    return (
      <React.Fragment>
        <div className="container">
          <Row>
            <p>
              <Row>
                <Col xs={8}>
                  <div style={{ margin: "0rem", padding: "0.7rem 0rem" }}>
                    {communities &&
                      communities.length > 0 &&
                      communities.map((c, index) => {
                        return (
                          <div key={c._id}>
                            <UserCommunity
                              key={c._id}
                              data={c}
                              upVote={this.upVote}
                              downVote={this.downVote}
                              index={index}
                            />
                          </div>
                        );
                      })}
                  </div>
                </Col>
                <Col>
                  <Row>
                    <Card>
                      <Card.Header style={{ borderBottom: "0px" }}>
                        <div>
                          <div
                            style={{
                              backgroundColor: "#33a8ff",
                              borderRadius: "4px 4px 0 0",
                              height: "94px",
                              left: "0",
                              position: "absolute",
                              top: "0",
                              width: "100%",
                            }}
                          ></div>
                          <div
                            style={{
                              backgroundColor: "#fff",
                              borderRadius: "6px",
                              boxSizing: "border-box",
                              height: "86px",
                              marginLeft: "-3px",
                              marginTop: "16px",
                              padding: "3px",
                              position: "relative",
                              width: "86px",
                              backgroundImage: `url(${user?.profile_picture_url ||
                                "https://www.redditstatic.com/avatars/avatar_default_07_7193FF.png"
                                })`,
                              backgroundSize: "cover",
                              border: "5px solid #f7f7f7",
                            }}
                          ></div>
                        </div>
                      </Card.Header>
                      <Card.Body>
                        <Row>
                          <Col xs={6}>
                            <h6>Name</h6>
                            <p>{user?.name}</p>
                          </Col>
                          <Col xs={6}>
                            <h6>Location</h6>
                            <p>{user?.location || "N/A"}</p>
                          </Col>
                        </Row>
                        <Row>
                          <Col>
                            <h6>Bio</h6>
                            <p>{user?.bio || "N/A"}</p>
                          </Col>
                        </Row>
                      </Card.Body>
                      {/* <Card.Footer>

                                            </Card.Footer> */}
                    </Card>
                  </Row>
                </Col>
              </Row>
            </p>
          </Row>
        </div>
      </React.Fragment>
    );
  }
}

class UserCommunity extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { data } = this.props;
    const {
      _id: community_id,
      imageURL,
      communityName,
      communityDescription,
      listOfUsersLength,
      // upVotedLength,
      // downVotedLength,
      postsLength,
      createdAt,
      ownerID,
    } = data || {};
    return (
      <React.Fragment>
        <Card style={{ margin: "0px" }}>
          <Card.Body style={{ padding: "1px" }}>
            <Row>
              <Col
                xs={1}
                style={{
                  background: "#eef3f7",
                  maxWidth: "5.8%",
                  marginLeft: "14px",
                }}
              >
                <div>
                  <i
                    style={{
                      cursor: "pointer",
                      color: this.props.data.userVoteDir == 1 ? "#ff4500" : "",
                    }}
                    className="icon icon-arrow-up"
                    onClick={() =>
                      this.props.upVote(
                        this.props.data._id,
                        this.props.data.userVoteDir,
                        this.props.index
                      )
                    }
                  ></i>

                  <span
                    style={{
                      whiteSpace: "nowrap",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      textAlign: "center",
                    }}
                  >
                    {/* {nFormatter(upVotedLength - downVotedLength, 1)} */}
                    {nFormatter(this.props.data.score, 1)}
                  </span>

                  <i
                    style={{
                      cursor: "pointer",
                      color: this.props.data.userVoteDir == -1 ? "#7193ff" : "",
                    }}
                    className="icon icon-arrow-down"
                    onClick={() =>
                      this.props.downVote(
                        this.props.data._id,
                        this.props.data.userVoteDir,
                        this.props.index
                      )
                    }
                  ></i>
                </div>
              </Col>
              <Col xs={2} style={{ paddingLeft: "1px", maxWidth: "12%" }}>
                {imageURL.length > 0 && imageURL[0].url ? (
                  <img
                    alt="Community"
                    role="presentation"
                    src={imageURL[0].url}
                    style={{
                      backgroundPosition: "50%",
                      backgroundRepeat: "no-repeat",
                      backgroundSize: "100%",
                      boxSizing: "border-box",
                      flex: "none",
                      fontSize: "32px",
                      lineHeight: "32px",
                      margin: "0 8px",
                      width: "65px",
                      verticalAlign: "middle",
                    }}
                  />
                ) : (
                  <div style={{ background: "#eef3f7", borderRadius: "5px" }}>
                    <img
                      src={DefaultCardText}
                      style={{ width: "65px", margin: "4px" }}
                    />
                  </div>
                )}
              </Col>
              <Col style={{ paddingLeft: "0px" }}>
                <Row style={{ paddingLeft: "0px" }}>
                  <h3
                    style={{
                      paddingLeft: "5px",
                      fontSize: "16px",
                      paddingTop: "8px",
                      margin: "0px",
                    }}
                  >
                    <Link to={"/community/".concat(community_id)}>
                      {communityName}
                    </Link>
                  </h3>
                  <h4
                    style={{ fontSize: "12px", padding: "8px", width: "95%" }}
                  >
                    {communityDescription.substr(0, 350)}
                  </h4>
                </Row>
                <Row style={{ paddingLeft: "0px" }}>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      color: "#878a8c",
                      fill: "#878a8c",
                      fontSize: "12px",
                    }}
                  >
                    <div style={{ marginLeft: "0px" }}>
                      <i className="fa fa-users"></i>
                      <span style={{ marginLeft: "4px" }}>
                        {" "}
                        {nFormatter(listOfUsersLength, 1)} Members
                      </span>
                    </div>
                    <div style={{ marginLeft: "10px" }}>
                      <i className="fa fa-sticky-note-o"></i>
                      <span style={{ marginLeft: "4px" }}>
                        {" "}
                        {nFormatter(postsLength, 1)} Posts
                      </span>
                    </div>
                    <div style={{ marginLeft: "10px" }}>
                      <i className="icon icon-user"></i>
                      <span style={{ marginLeft: "4px" }}>
                        {" "}
                        Created By{" "}
                        <Link to={"/user/".concat(ownerID?.userIDSQL)}>
                          {ownerID?.name}
                        </Link>{" "}
                        {getRelativeTime(createdAt)}
                      </span>
                    </div>
                  </div>
                </Row>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </React.Fragment>
    );
  }
}

export default User;
