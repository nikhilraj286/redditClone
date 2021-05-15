import React, { Component } from "react";
import { connect } from "react-redux";
import axios from "axios";
import { Row, Col, Form } from "react-bootstrap";

import backendServer from "../../../webConfig";
import SearchResult from "./SearchResult";
import { getToken, getMongoUserID } from "../../../services/ControllerUtils";

const options = {
  sortKey: {
    createdAt: "Created At",
    postsLength: "Most No Of Posts",
    listOfUsersLength: "Most No Of Users",
    upVotedLength: "Most UpVoted",
  },
  sortValue: {
    asc: "Ascending",
    desc: "Descending",
  },
  perPageValues: {
    2: "2",
    5: "5",
    10: "10",
  },
};

class CommunitySearch extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchText: this.getSearchQueryFromLocation(),
      processing: false,
      communities: [],
      hasMoreItems: true,
      pagingCounter: 0,
      perPage: 2,
      sortKey: "createdAt",
      sortValue: "desc",
    };
    this.upVote = this.upVote.bind(this);
    this.downVote = this.downVote.bind(this);
  }
  getSearchQueryFromLocation = () => {
    const qR = new URLSearchParams(this.props.location.search);
    return qR.get("q") || "";
  };
  isBottom = (el) => {
    return el.getBoundingClientRect().bottom <= window.innerHeight;
  };
  componentWillUnmount() {
    document.removeEventListener("scroll", this.trackScrolling);
  }
  trackScrolling = () => {
    const wrappedElement = document.getElementById("scroll_to_bottom_detector");
    if (this.isBottom(wrappedElement)) {
      this.processSearch();
    }
  };
  processSearch = (restart = false) => {
    if (restart || (!this.state.processing && this.state.hasMoreItems)) {
      this.setState(
        {
          processing: true,
          ...(restart
            ? {
                searchText: this.getSearchQueryFromLocation(),
                pagingCounter: 0,
                hasMoreItems: true,
                communities: [],
              }
            : {}),
        },
        async () => {
          try {
            const queryParams = new URLSearchParams({
              searchText: this.state.searchText,
              page: this.state.pagingCounter + 1,
              limit: this.state.perPage,
              sortKey: this.state.sortKey,
              sortValue: this.state.sortValue,
              userId: getMongoUserID(),
            }).toString();

            this.props.setLoader();

            axios.defaults.headers.common["authorization"] = getToken();
            const { data } = await axios.get(
              `${backendServer}/getAllCommunities?${queryParams}`
            );

            this.props.unsetLoader();

            const { docs, hasNextPage, pagingCounter } = data.communities || {};

            this.setState({
              communities: [...this.state.communities, ...docs],
              hasMoreItems: hasNextPage,
              pagingCounter,
              processing: false,
            });
          } catch (e) {
            console.log(e);
          }
        }
      );
    }
  };
  getSnapshotBeforeUpdate(prevProps) {
    return {
      newQuery: prevProps.location.search !== this.props.location.search,
    };
  }
  componentDidMount() {
    this.processSearch();
    document.addEventListener("scroll", this.trackScrolling);
  }
  componentDidUpdate(prevProps, prevState, snapshot) {
    const { newQuery } = snapshot;
    if (newQuery) {
      this.processSearch(true);
    }
    if (
      window.innerHeight >= document.body.clientHeight &&
      this.state.hasMoreItems
    ) {
      this.processSearch();
    }
  }
  // vote = async ({ community_id, voting }) => {
  //   try {
  //     axios.defaults.headers.common["authorization"] = getToken();
  //     const { data: { community } } = await axios.post(`${backendServer}/community/vote/${community_id}`, {
  //       "voting": Number(voting)
  //     });
  //     if(!community) { return; }
  //     const { communities } = this.state;

  //     let temp = communities.reduce((acc, it) => {
  //       acc[it._id] = it;
  //       return acc;
  //     }, {});

  //     temp[community._id].upVotedLength = community.upvotedBy.length;
  //     temp[community._id].downVotedLength = community.downvotedBy.length;

  //     this.setState({
  //       communities: Object.values(temp)
  //     });
  //   } catch (e) { console.log(e) }
  // }

  upVote(communityId, userVoteDir, index) {
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
  }

  downVote(postId, userVoteDir, index) {
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
  }

  render() {
    const { searchText, processing, communities } = this.state;
    return (
      <React.Fragment>
        <div className="container">
          <Row
            style={{
              background: this.props.darkMode ? "black" : "#DAE0E6",
              maxWidth: "100%",
            }}
          >
            <Col sm={12}>
              {searchText === "" ? (
                <div style={{ margin: "1rem" }}>List of All Communities</div>
              ) : (
                <div style={{ margin: "1rem" }}>
                  Community search results for <b>&quot;{searchText}&quot;</b>
                </div>
              )}
            </Col>
            <Col sm={12}>
              <div
                style={{
                  margin: "0 auto",
                  background: "#fff",
                  height: "50px",
                  borderRadius: "5px",
                }}
              >
                <div style={{ float: "left" }}>
                  <Form.Group style={{ margin: "5px", display: "inline-flex" }}>
                    <label
                      style={{
                        whiteSpace: "nowrap",
                        marginTop: "5px",
                        color: "#7d72728a",
                      }}
                    >
                      Sort By
                    </label>
                    <Form.Control
                      as="select"
                      onChange={(e) => {
                        this.setState({ sortKey: e.target.value }, () => {
                          this.processSearch(true);
                        });
                      }}
                      style={{
                        fontSize: "14px",
                        marginLeft: "5px",
                        fontWeight: "600",
                        width: "auto",
                      }}
                    >
                      {Object.keys(options.sortKey).map((key) => {
                        return (
                          <option
                            key={key}
                            selected={
                              this.state.sortKey === key ? "selected" : ""
                            }
                            value={key}
                          >
                            {options.sortKey[key]}
                          </option>
                        );
                      })}
                    </Form.Control>
                    <Form.Control
                      as="select"
                      onChange={(e) => {
                        this.setState({ sortValue: e.target.value }, () => {
                          this.processSearch(true);
                        });
                      }}
                      style={{
                        fontSize: "14px",
                        marginLeft: "5px",
                        fontWeight: "600",
                        width: "auto",
                      }}
                    >
                      {Object.keys(options.sortValue).map((key) => {
                        return (
                          <option
                            key={key}
                            selected={
                              this.state.sortValue === key ? "selected" : ""
                            }
                            value={key}
                          >
                            {options.sortValue[key]}
                          </option>
                        );
                      })}
                    </Form.Control>
                  </Form.Group>
                </div>
                <div style={{ float: "right" }}>
                  <Form.Group style={{ margin: "5px", display: "inline-flex" }}>
                    <label
                      style={{
                        whiteSpace: "nowrap",
                        marginTop: "5px",
                        color: "#7d72728a",
                      }}
                    >
                      Per Page
                    </label>
                    <Form.Control
                      as="select"
                      onChange={(e) => {
                        this.setState({ perPage: e.target.value }, () => {
                          this.processSearch(true);
                        });
                      }}
                      style={{
                        fontSize: "14px",
                        marginLeft: "5px",
                        fontWeight: "600",
                        width: "auto",
                      }}
                    >
                      {Object.keys(options.perPageValues).map((key) => {
                        return (
                          <option
                            key={key}
                            selected={
                              this.state.perPage === key ? "selected" : ""
                            }
                            value={key}
                          >
                            {options.perPageValues[key]}
                          </option>
                        );
                      })}
                    </Form.Control>
                  </Form.Group>
                </div>
              </div>
            </Col>
            <Col sm={12}>
              <div style={{ margin: "0rem", padding: "1rem 0rem" }}>
                {communities &&
                  communities.length > 0 &&
                  communities.map((c, index) => {
                    {
                      console.log("inside community rendering");
                    }
                    return (
                      <div
                        key={c._id}
                        style={
                          {
                            // height: "400px" // load more testing purpose due to low data
                          }
                        }
                      >
                        <SearchResult
                          key={c._id}
                          data={c}
                          upVote={this.upVote}
                          downVote={this.downVote}
                          index={index}
                        />
                      </div>
                    );
                  })}
                {!processing && communities.length === 0 && (
                  <div>
                    Sorry, there were no community results for “
                    <b>{searchText}</b>”
                  </div>
                )}
              </div>
              <div id="scroll_to_bottom_detector"></div>
            </Col>
            {processing && communities.length > 0 && (
              <Col sm={12}>
                <div style={{ textAlign: "center", height: "50px" }}>
                  <p>Loading more communities...</p>
                </div>
              </Col>
            )}
          </Row>
        </div>
      </React.Fragment>
    );
  }
}

export default connect((state) => {
  return state;
}, {})(CommunitySearch);
