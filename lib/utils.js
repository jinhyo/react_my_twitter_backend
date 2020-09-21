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

// async function checkDuplicateEmail(email) {
//   const exEmail = await User.findOne({ where: email });
//   if (exEmail) {
//     return true;
//   } else {
//     return false;
//   }
// }

module.exports = {
  getUserWithFullAttributes
  // checkDuplicateEmail
};
