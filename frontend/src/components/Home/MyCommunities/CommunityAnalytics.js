import React, { Component } from "react";
import Plot from "react-plotly.js";
//import Plotly from "plotly.js";
import backendServer from "../../../webConfig";
import axios from "axios";
import {
  getMongoUserID,
  getToken,
  sortByPost,
} from "../../../services/ControllerUtils";
import { Row, Col, Container } from "react-bootstrap";
class CommunityAnalytics extends Component {
  constructor(props) {
    super(props);
    this.state = {
      communityData: [],
      dataToPlot: [],
      dataForPost: [],
      dataToUpvote: [],
      dataForMaxPostByUser: [],
      layoutForBar: {
        height: 400,
        width: 500,
        xaxis: {
          title: {
            text: "Name of Community",
            font: {
              size: 18,
              color: "#7f7f7f",
            },
          },
        },
        yaxis: {
          title: {
            text: "No Of Post vs No of User ",
            font: {
              size: 18,
              color: "#7f7f7f",
            },
          },
        },
      },
    };
  }

  calculateValues(communityData) {
    let label = [];
    let yAxis = [];
    let yAxisUser = [];
    if (communityData.length > 0) {
      communityData.map((community) => {
        label.push(community.communityName);
        yAxis.push(community.NoOfPost);
        yAxisUser.push(community.acceptedUsersSQLIds.length + 1);
      });
      console.log(yAxis);
    }
    this.setState({
      dataToPlot: [
        {
          y: yAxis,
          x: label,
          type: "bar",
          name: "Post",
        },
        {
          y: yAxisUser,
          x: label,
          type: "bar",
          name: "User",
        },
      ],
    });
    // this.setState({
    //   data: [
    //     {
    //       values: yAxis,
    //       labels: label,
    //       type: "pie"
    //     }
    //   ]
    // });
  }

  CommunityWithMaximumPost(communityData) {
    const data = sortByPost(communityData);
    let label = [];
    let yAxis = [];
    if (data.length > 0) {
      data.map((community, idx) => {
        if (data.length > 5) {
          if (idx == 5) {
            this.setState({
              dataForPost: [
                {
                  values: yAxis,
                  labels: label,
                  type: "pie",
                  name: "Post",
                },
              ],
            });
            return;
          }
        }
        label.push(community.communityName);
        yAxis.push(community.NoOfPost);
      });
      this.setState({
        dataForPost: [
          {
            values: yAxis,
            labels: label,
            type: "pie",
            name: "Post",
          },
        ],
      });
      console.log(yAxis);
    }
  }

  GetNoOfPostPerCommunity() {
    const ID = getMongoUserID();
    console.log(`${backendServer}/communityAnalytics?ID=${ID}`);
    axios.defaults.headers.common["authorization"] = getToken();
    axios
      .get(`${backendServer}/communityAnalytics?ID=${ID}`)
      .then((response) => {
        if (response.status == 200) {
          this.setState({
            communityData: response.data,
          });
          console.log(response.data);
          this.calculateValues(response.data);
          this.CommunityWithMaximumPost(response.data);
        }
      })
      .catch((e) => {
        console.log(e);
        this.setState({
          error: "Community name is not unique",
        });
      });
  }

  getUsersWithMostsForEachCommunity = async () => {
    const ID = getMongoUserID();
    axios.defaults.headers.common["authorization"] = getToken();
    axios
      .get(`${backendServer}/getUsersWithMorePostsForCommunities?ID=${ID}`)
      .then((response) => {
        console.log(response.data);
        this.setState({
          mostUpvotedPost: response.data.mostUpvotedPost,
          userWithMaxPosts: response.data.userWithMaxPosts,
        });
        this.DrawGraphForUsers(response.data.mostUpvotedPost);
        this.DrawUserGraph(response.data.userWithMaxPosts);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  DrawGraphForUsers(mostUpvotedPost) {
    let label = [];
    let yAxis = [];
    if (mostUpvotedPost.length > 0) {
      mostUpvotedPost.map((post) => {
        label.push(post.communityName);
        yAxis.push(post.score);
      });
      console.log(yAxis);
    }
    this.setState({
      dataToUpvote: [
        {
          showlegend: true,
          legend: {
            x: 1,
            xanchor: "right",
            y: 1,
          },
          y: yAxis,
          x: label,
          type: "bar",
          name: "Post",
        },
      ],
    });
  }

  DrawUserGraph(userWithMaxPost) {
    console.log(userWithMaxPost);
    let labelMostPost = [];
    let yAxisMostPost = [];
    if (userWithMaxPost.length > 0) {
      userWithMaxPost.map((user) => {
        if (user && user.length > 0) {
          console.log(user);
          labelMostPost.push(user[0].communityName);
          yAxisMostPost.push(user[0].count);
          this.setState({
            dataForMaxPostByUser: [
              {
                showlegend: true,
                legend: {
                  x: 1,
                  xanchor: "right",
                  y: 1,
                },
                y: yAxisMostPost,
                x: labelMostPost,
                type: "bar",
                text: user[0].name,
                name: "communityName",
              },
            ],
          });
        }
      });
    }
  }

  componentDidMount() {
    this.GetNoOfPostPerCommunity();
    this.getUsersWithMostsForEachCommunity();
  }

  render() {
    return (
      <React.Fragment>
        <Container>
          <div
            style={{ textAlign: "center", fontSize: "24px", marginTop: "10px" }}
          >
            Community wise Analytics
          </div>
          {/* {JSON.stringify(this.state.mostUpvotedPost)} */}
          {/* {JSON.stringify(this.state.userWithMaxPosts)} */}
          <Row>
            <Col
              xs={6}
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                textAlign: "center",
              }}
            >
              <div style={{ display: "flex" }}>
                <Plot
                  name="noOfPost"
                  data={this.state.dataToPlot}
                  layout={this.state.layoutForBar}
                  onInitialized={(figure) => this.setState(figure)}
                  onUpdate={(figure) => this.setState(figure)}
                  style={{ width: "auto" }}
                />
              </div>
            </Col>
            <Col
              xs={6}
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                textAlign: "center",
                overflow: "hidden",
              }}
            >
              <div style={{ display: "flex", marginLeft: "-30%" }}>
                <Plot
                  name="noOfUser"
                  data={this.state.dataForPost}
                  onInitialized={(figure) => this.setState(figure)}
                  onUpdate={(figure) => this.setState(figure)}
                  style={{ width: "auto" }}
                />
              </div>
            </Col>
          </Row>
          <Row>
            <Col
              xs={6}
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                textAlign: "center",
                overflow: "hidden",
                position: "relative",
              }}
            >
              <div style={{ position: "absolute", right: "-13%" }}>
                <Plot
                  name="TopVotedPost"
                  data={this.state.dataToUpvote}
                  onInitialized={(figure) => this.setState(figure)}
                  onUpdate={(figure) => this.setState(figure)}
                  style={{ width: "auto" }}
                />
              </div>
            </Col>
            <Col>
              <Plot
                name="UserWithMaxPost"
                data={this.state.dataForMaxPostByUser}
                onInitialized={(figure) => this.setState(figure)}
                onUpdate={(figure) => this.setState(figure)}
                style={{ width: "auto" }}
              />
            </Col>
          </Row>
        </Container>
        {/* <div style={{ width: "100%", height: "100%" }}></div> */}
        {/* <Plot
          data={[
            {
              x: [1, 2, 3, 4],
              y: { yAxis },
              type: "scatter",
              mode: "lines+markers",
              marker: { color: "red" }
            },
            { type: "bar", x: [1, 2, 3, 4, 5, 6], y: { yAxis } }
          ]}
          layout={{ width: 500, height: 500, title: "A Fancy Plot" }}
        /> */}
      </React.Fragment>
    );
  }
}

export default CommunityAnalytics;
