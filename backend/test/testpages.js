const app = require("../index.js");
var chai = require("chai");
chai.use(require("chai-http"));
var expect = require("chai").expect;

var agent = require("chai").request.agent(app);
const auth =
  "JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NTEsImlhdCI6MTYyMTA0OTM3OCwiZXhwIjoxNjIyMDU3Mzc4fQ.GBTpfXBydRXHEvil84sJgzNRTM9306ozj0OMLR0ZfCw";

it("POST /loginUser", function (done) {
  agent
    .post("/login")
    .send({ email: "divya@gmail.com", password: "abcd" })
    .set("Authorization", auth)
    .then(function (res) {
      expect(res).to.have.status(200);
      done();
    })
    .catch(e => {
      done(e);
    });
});

describe("Reddit App", function () {
  it("GET ", function (done) {
    agent
      .get("/getUserProfileByMongoID?ID=609f4022e8ab974852c6020a")
      .set("authorization", auth) //
      .then(function (res) {
        expect(res).to.have.status(200);
        done();
      })
      .catch(e => {
        done(e);
      });
  });

  it("Get /getCommunitiesForOwner - get Community", function (done) {
    agent
      .get(
        "/getCommunitiesForOwner?ID=609f4022e8ab974852c6020a&page=0&size=2&search=''"
      )
      .set("Authorization", auth)
      .then(function (res) {
        expect(res).to.have.status(200);
        done();
      })
      .catch(e => {
        done(e);
      });
  });

  it("GET /getMessageUserNames", function (done) {
    agent
      .get("/getMessageUserNames?ID=51")
      .set("Authorization", auth)
      .then(function (res) {
        expect(res).to.have.status(200);
        done();
      })
      .catch(e => {
        done(e);
      });
  });

  it("Get /getCommunities - Get Communities", function (done) {
    agent
      .get("/getCommunities")
      .set("Authorization", auth)
      .then(function (res) {
        expect(res).to.have.status(200);
        done();
      })
      .catch(e => {
        done(e);
      });
  });
  describe("Get getNotification data", () => {
    it("Get /getNotificationData", done => {
      let data = {
        user_id: "609f4022e8ab974852c6020a"
      };
      agent
        .post("/getNotificationData")
        .set("authorization", auth)
        .send(data)
        .then(function (res) {
          expect(res).to.have.status(200);
          done();
        })
        .catch(e => {
          done(e);
        });
    });
  });

  describe("Get getCommunitiesCreatedByMe data", () => {
    it("Get /getCommunitiesCreatedByMe", done => {
      let data = {
        user_id: "609f4022e8ab974852c6020a"
      };
      agent
        .post("/getCommunitiesCreatedByMe")
        .set("authorization", auth)
        .send(data)
        .then(function (res) {
          expect(res).to.have.status(200);
          done();
        })
        .catch(e => {
          done(e);
        });
    });
  });

  describe("Post Comment", () => {
    it("post /comment", done => {
      let data = {
        user_id: "609f4022e8ab974852c6020a",
        postID: "609f4022e8ab974852c6020a",
        description: "Hahahah",
        isParentComment: 0,
        parentCommentID: "609f4022e8ab974852c6020a",
        communityID: "609f4022e8ab974852c6020a"
      };
      agent
        .post("/comment")
        .set("authorization", auth)
        .send(data)
        .then(function (res) {
          expect(res).to.have.status(200);
          done();
        })
        .catch(e => {
          done(e);
        });
    });
  });

  describe("Post Vote", () => {
    it("post /vote", done => {
      let data = {
        user_id: "609f4022e8ab974852c6020a",
        postID: "609f4022e8ab974852c6020a",
        description: "Hahahah",
        isParentComment: 0,
        parentCommentID: "609f4022e8ab974852c6020a",
        communityID: "609f4022e8ab974852c6020a"
      };
      agent
        .post("/comment")
        .set("authorization", auth)
        .send(data)
        .then(function (res) {
          expect(res).to.have.status(200);
          done();
        })
        .catch(e => {
          done(e);
        });
    });
  });

  describe("Post createPost", () => {
    it("post /createPost", done => {
      let data = {
        user_id: "609f4022e8ab974852c6020a",
        postID: "609f4022e8ab974852c6020a",
        description: "Hahahah",
        isParentComment: 0,
        parentCommentID: "609f4022e8ab974852c6020a",
        communityID: "609f4022e8ab974852c6020a"
      };
      agent
        .post("/comment")
        .set("authorization", auth)
        .send(data)
        .then(function (res) {
          expect(res).to.have.status(200);
          done();
        })
        .catch(e => {
          done(e);
        });
    });
  });
});
