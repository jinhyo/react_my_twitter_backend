"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.associate = void 0;
const sequelize_1 = require("sequelize");
const sequelize_2 = __importDefault(require("./sequelize"));
class Hashtag extends sequelize_1.Model {
}
Hashtag.init({
    tag: {
        type: sequelize_1.DataTypes.STRING(30),
        allowNull: false,
    },
    count: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
    },
}, {
    modelName: "hashtag",
    tableName: "hashtags",
    charset: "utf8mb4",
    collate: "utf8mb4_general_ci",
    paranoid: true,
    sequelize: sequelize_2.default,
});
function associate(db) {
    db.Hashtag.belongsToMany(db.Tweet, {
        through: "tweetHashtags",
        as: "hashtagTweets",
    });
}
exports.associate = associate;
exports.default = Hashtag;
