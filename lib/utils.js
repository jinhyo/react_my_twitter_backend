const { User, Tweet } = require("../models/index");

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

module.exports = {
  getUserWithFullAttributes
};
