"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserWithFullAttributesByNickname = exports.getTweetsWithHashtag = exports.getSpecificUsersFavorits = exports.getSpecificUsersMedias = exports.getSpecificUsersComments = exports.getSpecificUsersTweets = exports.getCommentsWithFullAttributes = exports.getQuotationsWithFullAttributes = exports.getTweetStatus = exports.getTweetsWithFullAttributes = exports.getTweetWithFullAttributes = exports.getUserWithFullAttributes = void 0;
const user_1 = __importDefault(require("../models/user"));
const tweet_1 = __importDefault(require("../models/tweet"));
const image_1 = __importDefault(require("../models/image"));
const hashtag_1 = __importDefault(require("../models/hashtag"));
const sequelize_1 = require("sequelize");
async function getUserWithFullAttributes(userId) {
    const fullUserWithoutPassword = await user_1.default.findOne({
        where: { id: userId },
        attributes: {
            exclude: ["password", "updatedAt", "deletedAt", "snsId", "loginType"],
        },
        include: [
            {
                model: user_1.default,
                as: "followings",
                attributes: ["id"],
                through: {
                    attributes: [],
                },
            },
            {
                model: user_1.default,
                as: "followers",
                attributes: ["id"],
                through: {
                    attributes: [],
                },
            },
            {
                model: tweet_1.default,
                attributes: [
                    "id",
                    "retweetOriginId",
                    "quotedOriginId",
                    "commentedOriginId",
                    "hasMedia",
                ],
            },
            {
                model: tweet_1.default,
                as: "retweets",
                attributes: ["id"],
                through: {
                    attributes: [],
                },
            },
            {
                model: tweet_1.default,
                as: "quotedTweets",
                attributes: ["id"],
                through: {
                    attributes: [],
                },
            },
            {
                model: tweet_1.default,
                as: "favorites",
                through: {
                    attributes: [],
                },
                attributes: ["id"],
            },
        ],
    });
    return fullUserWithoutPassword;
}
exports.getUserWithFullAttributes = getUserWithFullAttributes;
async function getUserWithFullAttributesByNickname(userNickname) {
    const fullUserWithoutPassword = await user_1.default.findOne({
        where: { nickname: userNickname },
        attributes: {
            exclude: ["password", "updatedAt", "deletedAt", "snsId", "loginType"],
        },
        include: [
            {
                model: user_1.default,
                as: "followings",
                attributes: ["id"],
                through: {
                    attributes: [],
                },
            },
            {
                model: user_1.default,
                as: "followers",
                attributes: ["id"],
                through: {
                    attributes: [],
                },
            },
            {
                model: tweet_1.default,
                attributes: [
                    "id",
                    "retweetOriginId",
                    "quotedOriginId",
                    "commentedOriginId",
                    "hasMedia",
                ],
            },
            {
                model: tweet_1.default,
                as: "retweets",
                attributes: ["id"],
                through: {
                    attributes: [],
                },
            },
            {
                model: tweet_1.default,
                as: "quotedTweets",
                attributes: ["id"],
                through: {
                    attributes: [],
                },
            },
            {
                model: tweet_1.default,
                as: "favorites",
                through: {
                    attributes: [],
                },
                attributes: ["id"],
            },
        ],
    });
    return fullUserWithoutPassword;
}
exports.getUserWithFullAttributesByNickname = getUserWithFullAttributesByNickname;
const TWEET_INCLUSION_BASE = [
    { model: user_1.default, attributes: ["id", "nickname", "avatarURL", "location"] },
    {
        model: user_1.default,
        as: "likers",
        attributes: ["id"],
        through: {
            attributes: [],
        },
    },
    { model: image_1.default, attributes: ["src"] },
    {
        model: tweet_1.default,
        as: "retweetOrigin",
        attributes: {
            exclude: ["updatedAt", "deletedAt"],
        },
        include: [
            { model: user_1.default, attributes: ["id", "nickname", "avatarURL", "location"] },
            { model: image_1.default, attributes: ["src"] },
            {
                model: user_1.default,
                as: "likers",
                attributes: ["id"],
                through: {
                    attributes: [],
                },
            },
            {
                model: tweet_1.default,
                as: "commentedOrigin",
                attributes: ["id"],
                include: [{ model: user_1.default, attributes: ["id", "nickname"] }],
            },
            {
                model: tweet_1.default,
                as: "quotedOrigin",
                attributes: {
                    exclude: ["updatedAt", "deletedAt"],
                },
                include: [
                    {
                        model: user_1.default,
                        attributes: ["id", "nickname", "avatarURL", "location"],
                    },
                    { model: image_1.default, attributes: ["src"] },
                ],
            },
            {
                model: tweet_1.default,
                as: "comments",
                attributes: ["id"],
            },
        ],
    },
    {
        model: tweet_1.default,
        as: "quotedOrigin",
        paranoid: false,
        attributes: {
            exclude: ["updatedAt", "deletedAt"],
        },
        include: [
            { model: user_1.default, attributes: ["id", "nickname", "avatarURL", "location"] },
            { model: image_1.default, attributes: ["src"] },
        ],
    },
    {
        model: tweet_1.default,
        as: "comments",
        attributes: ["id"],
    },
    {
        model: tweet_1.default,
        as: "commentedOrigin",
        attributes: ["id"],
        include: [{ model: user_1.default, attributes: ["id", "nickname"] }],
    },
];
async function getTweetWithFullAttributes(tweetId) {
    const tweetWithOthers = await tweet_1.default.findOne({
        where: { id: tweetId },
        attributes: {
            exclude: ["updatedAt", "deletedAt"],
        },
        include: TWEET_INCLUSION_BASE,
    });
    return tweetWithOthers;
}
exports.getTweetWithFullAttributes = getTweetWithFullAttributes;
async function getTweetsWithFullAttributes(where, limit) {
    const tweetsWithOthers = await tweet_1.default.findAll({
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
exports.getTweetsWithFullAttributes = getTweetsWithFullAttributes;
async function getTweetStatus(tweetId) {
    const tweetWithOthers = await tweet_1.default.findOne({
        where: { id: tweetId },
        attributes: {
            exclude: ["updatedAt", "deletedAt"],
        },
        include: [
            ...TWEET_INCLUSION_BASE,
            {
                model: tweet_1.default,
                as: "retweets",
                attributes: ["id"],
            },
            {
                model: tweet_1.default,
                as: "quotations",
                attributes: ["id"],
            },
        ],
    });
    return tweetWithOthers;
}
exports.getTweetStatus = getTweetStatus;
async function getQuotationsWithFullAttributes(quotedOriginId) {
    const tweetsWithOthers = await tweet_1.default.findAll({
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
exports.getQuotationsWithFullAttributes = getQuotationsWithFullAttributes;
async function getCommentsWithFullAttributes(commentedOriginId) {
    const tweetsWithOthers = await tweet_1.default.findAll({
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
exports.getCommentsWithFullAttributes = getCommentsWithFullAttributes;
async function getSpecificUsersTweets(userId) {
    const tweetsWithOthers = await tweet_1.default.findAll({
        where: { userId: userId, commentedOriginId: null },
        order: [["createdAt", "DESC"]],
        attributes: {
            exclude: ["updatedAt", "deletedAt"],
        },
        include: TWEET_INCLUSION_BASE,
    });
    return tweetsWithOthers;
}
exports.getSpecificUsersTweets = getSpecificUsersTweets;
async function getSpecificUsersComments(userId) {
    const tweetsWithOthers = await tweet_1.default.findAll({
        where: { userId: userId, commentedOriginId: { [sequelize_1.Op.ne]: null } },
        order: [["createdAt", "DESC"]],
        attributes: {
            exclude: ["updatedAt", "deletedAt"],
        },
        include: TWEET_INCLUSION_BASE,
    });
    return tweetsWithOthers;
}
exports.getSpecificUsersComments = getSpecificUsersComments;
async function getSpecificUsersMedias(userId) {
    const tweetsWithOthers = await tweet_1.default.findAll({
        where: { userId: userId, hasMedia: true },
        order: [["createdAt", "DESC"]],
        attributes: {
            exclude: ["updatedAt", "deletedAt"],
        },
        include: TWEET_INCLUSION_BASE,
    });
    return tweetsWithOthers;
}
exports.getSpecificUsersMedias = getSpecificUsersMedias;
async function getSpecificUsersFavorits(userId) {
    const user = await user_1.default.findOne({
        where: { id: userId },
        order: [
            ["createdAt", "DESC"],
            [{ model: tweet_1.default, as: "favorites" }, "createdAt", "DESC"],
        ],
        attributes: [],
        include: {
            model: tweet_1.default,
            as: "favorites",
            through: {
                attributes: [],
            },
            attributes: {
                exclude: ["updatedAt", "deletedAt"],
            },
            include: TWEET_INCLUSION_BASE,
        },
    });
    return user.favorites;
}
exports.getSpecificUsersFavorits = getSpecificUsersFavorits;
async function getTweetsWithHashtag(whereInTweet, tagName) {
    const tweetsWithOthers = await hashtag_1.default.findOne({
        where: { tag: tagName },
        order: [
            ["createdAt", "DESC"],
            [{ model: tweet_1.default, as: "hashtagTweets" }, "createdAt", "DESC"],
        ],
        attributes: {
            exclude: ["updatedAt", "deletedAt"],
        },
        include: {
            model: tweet_1.default,
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
exports.getTweetsWithHashtag = getTweetsWithHashtag;
