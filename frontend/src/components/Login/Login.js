import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import axios from "axios";
import backendServer from "../../webConfig";
import { connect } from "react-redux";
import { loginRedux } from "../../reduxOps/reduxActions/loginRedux";
import { Row, Col, Form, Button } from "react-bootstrap";
import "./../styles/loginStyle.css";
import { SetLocalStorage } from "../../services/ControllerUtils";

class Login extends Component {
  constructor(props) {
    super(props);
    {
      this.state = {
        error: "",
        redirect: <Redirect to="/" />,
        token: ""
      };
    }
  }

  emailEventHandler = e => {
    this.setState({
      email: e.target.value
    });
  };

  passEventHandler = e => {
    this.setState({
      password: e.target.value
    });
  };
  ///LoginUser'
  submitForm = e => {
    //prevent page from refresh
    e.preventDefault();
    const data = {
      email: this.state.email,
      password: this.state.password
    };
    this.props.loginRedux(data);

    //set the with credentials to true
  };

  getUserProfile() {
    console.log(this.props.user.userID.user_id);
    axios
      .get(
        `${backendServer}/getUserProfile?ID=${this.props.user.userID.user_id}`
      )
      .then(response => {
        if (response.status == 200) {
          console.log(response.data);
          const data = response.data;
          data.token = this.props.user.token;
          SetLocalStorage(data);
          this.setState({
            redirect: <Redirect to="/home" />
          });
        }
      })
      .catch(error => console.log("error " + error));
  }

  componentDidUpdate(prevState) {
    if (prevState.user != this.props.user) {
      if (prevState.error != this.props.error && this.props.error.length > 0) {
        this.setState({
          formerror: {},
          error: this.props.error
        });
      } else {
        this.setState({
          error: ""
        });
        this.getUserProfile();
      }
    }
  }

  render() {
    return (
      <div className="container-fluid" style={{ padding: "0" }}>
        {this.state.redirect}
        <Row style={{ padding: "0", margin: "0" }}>
          <Col className="col-2" style={{ padding: "0", height: "648px" }}>
            <img
              className="reddit-login"
              alt="Reddit Background"
              src="https://www.redditstatic.com/accountmanager/bbb584033aa89e39bad69436c504c9bd.png"
              style={{ height: "100%", width: "100%" }}
            />
          </Col>
          <Col className="login-form" style={{ paddingLeft: "30px" }}>
            <div
              style={{ fontSize: "24px", fontWeight: "500", marginTop: "35px" }}
            >
              Login
            </div>
            <span style={{ fontSize: "12px" }}>
              By continuing, you agree to our User Agreement and Privacy Policy.
            </span>
            <div style={{ width: "45%", marginTop: "50px" }}>
              <div className="Sso__button Sso__googleIdButton">
                Continue with Google
              </div>
              <div className="Sso__button Sso__appleIdContainer">
                Continue with Apple
              </div>
              <div
                className="Sso__divider"
                hidden={this.state.error.length > 0 ? true : false}
              >
                <span className="Sso__dividerLine"></span>
                <span className="Sso__dividerText">or</span>
                <span className="Sso__dividerLine"></span>
              </div>
              <div
                id="errorLogin"
                hidden={this.state.error.length > 0 ? false : true}
                className="alert alert-danger"
                role="alert"
              >
                {this.state.error}
              </div>
            </div>
            <Form
              className="loginForm"
              style={{ width: "45%" }}
              onSubmit={this.submitForm}
            >
              <Form.Group>
                <Form.Label htmlFor="email" className="Lable-align">
                  Email address
                </Form.Label>
                <Form.Control
                  data-testid="email-input-box"
                  type="email"
                  id="email"
                  name="email"
                  maxLength="150"
                  placeholder="Email"
                  onChange={this.emailEventHandler}
                  pattern="[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$"
                  title="Invalid email address"
                  required
                ></Form.Control>
              </Form.Group>

              <Form.Group>
                <Form.Label htmlFor="password">Password</Form.Label>
                <Form.Control
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Password"
                  maxLength="25"
                  onChange={this.passEventHandler}
                  required
                ></Form.Control>
              </Form.Group>
              <Form.Group>
                <Button
                  data-testid="btn-submit"
                  type="submit"
                  className="btn btn-Login"
                  color="btn btn-primary"
                >
                  Login
                </Button>
              </Form.Group>
            </Form>

            <div style={{ fontSize: "13px" }}>
              New to Reddit?{" "}
              <div
                style={{
                  color: "rgb(0, 121, 211)",
                  cursor: "pointer",
                  display: "inline-block",
                  fontWeight: "700"
                }}
                onClick={() => {
                  this.props.signup();
                }}
              >
                SIGN UP
              </div>
            </div>
          </Col>
        </Row>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    user: state.login.user,
    error: state.login.error
  };
};

export default connect(mapStateToProps, { loginRedux })(Login);
