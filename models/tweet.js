"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.associate = void 0;
const sequelize_1 = require("sequelize");
const sequelize_2 = __importDefault(require("./sequelize"));
class Tweet extends sequelize_1.Model {
}
Tweet.init({
    contents: {
        type: sequelize_1.DataTypes.STRING(200),
        allowNull: false,
    },
    hasMedia: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    retweetedCount: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
}, {
    modelName: "tweet",
    tableName: "tweets",
    charset: "utf8mb4",
    collate: "utf8mb4_general_ci",
    paranoid: true,
    sequelize: sequelize_2.default,
});
function associate(db) {
    db.Tweet.belongsTo(db.User);
    db.Tweet.belongsTo(db.Tweet, {
        as: "retweetOrigin",
        foreignKey: "retweetOriginId",
    });
    db.Tweet.hasMany(db.Tweet, {
        as: "retweets",
        foreignKey: "retweetOriginId",
    });
    db.Tweet.belongsTo(db.Tweet, {
        as: "quotedOrigin",
        foreignKey: "quotedOriginId",
    });
    db.Tweet.hasMany(db.Tweet, {
        as: "quotations",
        foreignKey: "quotedOriginId",
    });
    db.Tweet.belongsTo(db.Tweet, {
        as: "commentedOrigin",
        foreignKey: "commentedOriginId",
    });
    db.Tweet.hasMany(db.Tweet, {
        as: "comments",
        foreignKey: "commentedOriginId",
    });
    db.Tweet.belongsToMany(db.User, { through: "likes", as: "likers" });
    db.Tweet.belongsToMany(db.Hashtag, { through: "tweetHashtags" });
    db.Tweet.hasMany(db.Image);
    db.Tweet.belongsToMany(db.User, {
        through: "userRetweets",
        as: "choosers",
    });
    db.Tweet.belongsToMany(db.User, {
        through: "userQuotedTweets",
        as: "writers",
    });
}
exports.associate = associate;
exports.default = Tweet;
