import User from "../models/user";
import Tweet from "../models/tweet";
import Image from "../models/image";
import Hashtag from "../models/hashtag";
import { Op } from "sequelize";

async function getUserWithFullAttributes(userId: number) {
  const fullUserWithoutPassword = await User.findOne({
    where: { id: userId },
    attributes: {
      exclude: ["password", "updatedAt", "deletedAt", "snsId", "loginType"],
    },
    include: [
      {
        model: User,
        as: "followings",
        attributes: ["id"],
        through: {
          attributes: [],
        },
      },
      {
        model: User,
        as: "followers",
        attributes: ["id"],
        through: {
          attributes: [],
        },
      },
      {
        model: Tweet,
        attributes: [
          "id",
          "retweetOriginId",
          "quotedOriginId",
          "commentedOriginId",
          "hasMedia",
        ],
      },
      {
        model: Tweet, // 리트윗한 트윗들
        as: "retweets",
        attributes: ["id"],
        through: {
          attributes: [],
        },
      },
      {
        model: Tweet, // 인용한 트윗들
        as: "quotedTweets",
        attributes: ["id"],
        through: {
          attributes: [],
        },
      },
      {
        model: Tweet, // 좋아요 누른 트윗들
        as: "favorites",
        through: {
          attributes: [], // juction table 정보 제외
        },
        attributes: ["id"],
      },
    ],
  });

  return fullUserWithoutPassword;
}

async function getUserWithFullAttributesByNickname(userNickname: string) {
  const fullUserWithoutPassword = await User.findOne({
    where: { nickname: userNickname },
    attributes: {
      exclude: ["password", "updatedAt", "deletedAt", "snsId", "loginType"],
    },
    include: [
      {
        model: User,
        as: "followings",
        attributes: ["id"],
        through: {
          attributes: [],
        },
      },
      {
        model: User,
        as: "followers",
        attributes: ["id"],
        through: {
          attributes: [],
        },
      },
      {
        model: Tweet,
        attributes: [
          "id",
          "retweetOriginId",
          "quotedOriginId",
          "commentedOriginId",
          "hasMedia",
        ],
      },
      {
        model: Tweet, // 리트윗한 트윗들
        as: "retweets",
        attributes: ["id"],
        through: {
          attributes: [],
        },
      },
      {
        model: Tweet, // 인용한 트윗들
        as: "quotedTweets",
        attributes: ["id"],
        through: {
          attributes: [],
        },
      },
      {
        model: Tweet, // 좋아요 누른 트윗들
        as: "favorites",
        through: {
          attributes: [], // juction table 정보 제외
        },
        attributes: ["id"],
      },
    ],
  });

  return fullUserWithoutPassword;
}

const TWEET_INCLUSION_BASE = [
  { model: User, attributes: ["id", "nickname", "avatarURL", "location"] },
  {
    model: User,
    as: "likers",
    attributes: ["id"],
    through: {
      attributes: [], // juction table 정보 제외
    },
  },
  { model: Image, attributes: ["src"] },
  {
    model: Tweet, // 리트윗 원본
    as: "retweetOrigin",
    attributes: {
      exclude: ["updatedAt", "deletedAt"],
    },
    include: [
      { model: User, attributes: ["id", "nickname", "avatarURL", "location"] }, // 리트윗 원본 작성자
      { model: Image, attributes: ["src"] },
      {
        model: User,
        as: "likers",
        attributes: ["id"],
        through: {
          attributes: [], // juction table 정보 제외
        },
      },
      {
        model: Tweet,
        as: "commentedOrigin",
        attributes: ["id"],
        include: [{ model: User, attributes: ["id", "nickname"] }],
      },
      {
        model: Tweet, // 인용된 트윗 원본
        as: "quotedOrigin",
        attributes: {
          exclude: ["updatedAt", "deletedAt"],
        },
        include: [
          {
            model: User,
            attributes: ["id", "nickname", "avatarURL", "location"],
          },
          { model: Image, attributes: ["src"] },
        ],
      },
      {
        model: Tweet, // 현재 트윗에 달린 댓글들
        as: "comments",
        attributes: ["id"],
      },
    ],
  },
  {
    model: Tweet, // 인용된 트윗 원본
    as: "quotedOrigin",
    paranoid: false,
    attributes: {
      exclude: ["updatedAt", "deletedAt"],
    },
    include: [
      { model: User, attributes: ["id", "nickname", "avatarURL", "location"] },
      { model: Image, attributes: ["src"] },
    ],
  },
  {
    model: Tweet, // 현재 트윗에 달린 댓글들
    as: "comments",
    attributes: ["id"],
  },
  {
    model: Tweet, // 현재 트윗이 어디에 댓글을 달았는지
    as: "commentedOrigin",
    attributes: ["id"],
    include: [{ model: User, attributes: ["id", "nickname"] }],
  },
];

async function getTweetWithFullAttributes(tweetId: number) {
  const tweetWithOthers = await Tweet.findOne({
    where: { id: tweetId },
    attributes: {
      exclude: ["updatedAt", "deletedAt"],
    },
    include: TWEET_INCLUSION_BASE,
  });

  return tweetWithOthers;
}

interface IWhere {
  id?: any;
  commentedOriginId?: number | string | null;
}

async function getTweetsWithFullAttributes(where: any, limit: number) {
  const tweetsWithOthers = await Tweet.findAll({
    where,
    limit,
    order: [["createdAt", "DESC"]],
    attributes: {
      exclude: ["updatedAt", "deletedAt"],
    },
    include: TWEET_INCLUSION_BASE,
  });

  return tweetsWithOthers;
}

async function getTweetStatus(tweetId: number) {
  const tweetWithOthers = await Tweet.findOne({
    where: { id: tweetId },
    attributes: {
      exclude: ["updatedAt", "deletedAt"],
    },
    include: [
      ...TWEET_INCLUSION_BASE,
      {
        model: Tweet, // 현재 트윗을 리트윗한 트윗들
        as: "retweets",
        attributes: ["id"],
      },
      {
        model: Tweet, // 현재 트윗을 인용한 트윗들
        as: "quotations",
        attributes: ["id"],
      },
    ],
  });

  return tweetWithOthers;
}

async function getQuotationsWithFullAttributes(quotedOriginId: number) {
  const tweetsWithOthers = await Tweet.findAll({
    where: {
      quotedOriginId,
    },
    order: [["createdAt", "DESC"]],
    attributes: {
      exclude: ["updatedAt", "deletedAt"],
    },
    include: TWEET_INCLUSION_BASE,
  });

  return tweetsWithOthers;
}

async function getCommentsWithFullAttributes(commentedOriginId: number) {
  const tweetsWithOthers = await Tweet.findAll({
    where: {
      commentedOriginId,
    },
    order: [["createdAt", "DESC"]],
    attributes: {
      exclude: ["updatedAt", "deletedAt"],
    },
    include: TWEET_INCLUSION_BASE,
  });

  return tweetsWithOthers;
}

async function getSpecificUsersTweets(userId: number) {
  const tweetsWithOthers = await Tweet.findAll({
    where: { userId: userId, commentedOriginId: null },
    order: [["createdAt", "DESC"]],
    attributes: {
      exclude: ["updatedAt", "deletedAt"],
    },
    include: TWEET_INCLUSION_BASE,
  });

  return tweetsWithOthers;
}

async function getSpecificUsersComments(userId: number) {
  const tweetsWithOthers = await Tweet.findAll({
    where: { userId: userId, commentedOriginId: { [Op.ne]: null } },
    order: [["createdAt", "DESC"]],
    attributes: {
      exclude: ["updatedAt", "deletedAt"],
    },
    include: TWEET_INCLUSION_BASE,
  });

  return tweetsWithOthers;
}

async function getSpecificUsersMedias(userId: number) {
  const tweetsWithOthers = await Tweet.findAll({
    where: { userId: userId, hasMedia: true },
    order: [["createdAt", "DESC"]],
    attributes: {
      exclude: ["updatedAt", "deletedAt"],
    },
    include: TWEET_INCLUSION_BASE,
  });

  return tweetsWithOthers;
}

async function getSpecificUsersFavorits(userId: number) {
  const user = await User.findOne({
    where: { id: userId },
    order: [
      ["createdAt", "DESC"],
      [{ model: Tweet, as: "favorites" }, "createdAt", "DESC"],
    ],
    attributes: [],
    include: {
      model: Tweet, // 좋아요 누른 트윗들
      as: "favorites",
      through: {
        attributes: [], // juction table 정보 제외
      },
      attributes: {
        exclude: ["updatedAt", "deletedAt"],
      },
      include: TWEET_INCLUSION_BASE,
    },
  });

  return user!.favorites;
}

async function getTweetsWithHashtag(whereInTweet: any, tagName: string) {
  const tweetsWithOthers = await Hashtag.findOne({
    where: { tag: tagName },
    order: [
      ["createdAt", "DESC"],
      [{ model: Tweet, as: "hashtagTweets" }, "createdAt", "DESC"],
    ],
    attributes: {
      exclude: ["updatedAt", "deletedAt"],
    },
    include: {
      model: Tweet,
      where: whereInTweet,
      as: "hashtagTweets",
      through: {
        attributes: [],
      },
      attributes: {
        exclude: ["updatedAt", "deletedAt"],
      },
      include: TWEET_INCLUSION_BASE,
    },
  });

  return tweetsWithOthers;
}

export {
  getUserWithFullAttributes,
  getTweetWithFullAttributes,
  getTweetsWithFullAttributes,
  getTweetStatus,
  getQuotationsWithFullAttributes,
  getCommentsWithFullAttributes,
  getSpecificUsersTweets,
  getSpecificUsersComments,
  getSpecificUsersMedias,
  getSpecificUsersFavorits,
  getTweetsWithHashtag,
  getUserWithFullAttributesByNickname,
};
