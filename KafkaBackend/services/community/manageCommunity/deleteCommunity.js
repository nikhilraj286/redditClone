const Community = require("../../../models/mongo/Community");
const Post = require("../../../models/mongo/Post");
const Comment = require("../../../models/mongo/Comment");

const deleteCommunity = async (msg, callback) => {
  try {
    Community.findOneAndDelete({ _id: msg.community_id }).then(async () => {
      await Post.deleteMany({ communityID: msg.community_id });
      await Comment.deleteMany({ communityID: msg.community_id });
      callback(null, {});
    });
  } catch (err) {
    callback(err, null);
  }
};

exports.deleteCommunity = deleteCommunity;
