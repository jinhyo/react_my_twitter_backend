"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.associate = void 0;
const sequelize_1 = require("sequelize");
const sequelize_2 = __importDefault(require("./sequelize"));
class User extends sequelize_1.Model {
}
User.init({
    nickname: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: false,
        unique: true,
    },
    email: {
        type: sequelize_1.DataTypes.STRING(30),
        allowNull: false,
    },
    password: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: false,
    },
    loginType: {
        type: sequelize_1.DataTypes.STRING(10),
        defaultValue: "local",
        allowNull: false,
    },
    avatarURL: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    snsId: sequelize_1.DataTypes.STRING(30),
    selfIntro: sequelize_1.DataTypes.STRING(100),
    location: sequelize_1.DataTypes.STRING(20),
}, {
    modelName: "user",
    tableName: "users",
    charset: "utf8",
    collate: "utf8_general_ci",
    paranoid: true,
    sequelize: sequelize_2.default,
});
function associate(db) {
    db.User.hasMany(db.Tweet);
    db.User.belongsToMany(db.Tweet, { through: "likes", as: "favorites" });
    db.User.belongsToMany(db.User, {
        through: "follows",
        as: "followers",
        foreignKey: "followingId",
    });
    db.User.belongsToMany(db.User, {
        through: "follows",
        as: "followings",
        foreignKey: "followerId",
    });
    db.User.belongsToMany(db.Tweet, {
        // 내가 리트윗한 리스트
        through: "userRetweets",
        as: "retweets",
    });
    db.User.belongsToMany(db.Tweet, {
        // 내가 리트윗한 리스트
        through: "userQuotedTweets",
        as: "quotedTweets",
    });
}
exports.associate = associate;
exports.default = User;
