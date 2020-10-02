const { User, Tweet, Image } = require("../models/index");
const { Op } = require("sequelize");

async function getUserWithFullAttributes(userId) {
  const fullUserWithoutPassword = await User.findOne({
    where: { id: userId },
    attributes: {
      exclude: ["password", "updatedAt", "deletedAt", "snsId", "loginType"]
    },
    include: [
      { model: User, as: "followings", attributes: ["id"] },
      { model: User, as: "followers", attributes: ["id"] },
      { model: Tweet, attributes: ["id", "retweetOriginId"] },
      {
        model: Tweet, // 리트윗한 트윗들
        as: "retweets",
        attributes: ["id"],
        through: {
          attributes: []
        }
      },
      {
        model: Tweet, // 인용한 트윗들
        as: "quotedTweets",
        attributes: ["id"],
        through: {
          attributes: []
        }
      },
      {
        model: Tweet, // 좋아요 누른 트윗들
        as: "favorites",
        through: {
          attributes: [] // juction table 정보 제외
        },
        attributes: ["id"]
      }
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
      { model: Image, attributes: ["src"] },
      {
        model: Tweet, // 리트윗 원본
        as: "retweetOrigin",
        attributes: {
          exclude: ["updatedAt", "deletedAt"]
        },
        include: [
          { model: User, attributes: ["id", "nickname", "avatarURL"] }, // 리트윗 원본 작성자
          { model: Image, attributes: ["src"] },
          {
            model: User,
            as: "likers",
            attributes: ["id"],
            through: {
              attributes: [] // juction table 정보 제외
            }
          }
        ]
      },
      {
        model: Tweet, // 인용된 트윗 원본
        as: "quotedOrigin",
        attributes: {
          exclude: ["updatedAt", "deletedAt"]
        },
        include: [
          { model: User, attributes: ["id", "nickname", "avatarURL"] },
          { model: Image, attributes: ["src"] }
        ]
      }
    ]
  });

  return tweetWithOthers;
}

async function getTweetsWithFullAttributes(where, limit) {
  const tweetsWithOthers = await Tweet.findAll({
    where,
    limit,
    order: [["createdAt", "DESC"]],
    attributes: {
      exclude: ["updatedAt", "deletedAt"]
    },
    include: [
      { model: User, attributes: ["id", "nickname", "avatarURL"] },
      {
        model: User,
        as: "likers",
        attributes: ["id"],
        through: {
          attributes: [] // juction table 정보 제외
        }
      },

      { model: Image, attributes: ["src"] },
      {
        model: Tweet, // 리트윗 원본
        as: "retweetOrigin",
        attributes: {
          exclude: ["updatedAt", "deletedAt"]
        },
        include: [
          { model: User, attributes: ["id", "nickname", "avatarURL"] }, // 리트윗 원본 작성자
          { model: Image, attributes: ["src"] },
          {
            model: User,
            as: "likers",
            attributes: ["id"],
            through: {
              attributes: [] // juction table 정보 제외
            }
          }
        ]
      },
      {
        model: Tweet, // 인용된 트윗 원본
        as: "quotedOrigin",
        attributes: {
          exclude: ["updatedAt", "deletedAt"]
        },
        include: [
          { model: User, attributes: ["id", "nickname", "avatarURL"] },
          { model: Image, attributes: ["src"] }
        ]
      }
    ]
  });

  console.log("11tweetsWithOthers", tweetsWithOthers.toString);

  return tweetsWithOthers;
}

module.exports = {
  getUserWithFullAttributes,
  getTweetWithFullAttributes,
  getTweetsWithFullAttributes
};
