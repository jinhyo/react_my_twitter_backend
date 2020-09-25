const { User, Tweet, Image } = require("../models/index");

async function getUserWithFullAttributes(userId) {
  const fullUserWithoutPassword = await User.findOne({
    where: { id: userId },
    attributes: {
      exclude: ["password", "updatedAt", "deletedAt", "snsId", "loginType"]
    },
    include: [
      { model: Tweet, attributes: ["id"] },
      { model: User, as: "followings", attributes: ["id"] },
      { model: User, as: "followers", attributes: ["id"] }
    ]
  });

  return fullUserWithoutPassword;
}

async function getTweetWithFullAttributes(tweetId) {
  const tweetWithOthers = await Tweet.findOne({
    where: { id: tweetId },
    attributes: {
      exclude: ["updatedAt", "deletedAt"]
    },
    include: [
      { model: User, attributes: ["id", "nickname", "avatarURL"] },
      { model: User, as: "likers", attributes: ["id"] },
      { model: Image, attributes: ["src"] }
    ]
  });

  return tweetWithOthers;
}

module.exports = {
  getUserWithFullAttributes,
  getTweetWithFullAttributes
};
