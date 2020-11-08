"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.associate = void 0;
const sequelize_1 = require("sequelize");
const sequelize_2 = __importDefault(require("./sequelize"));
class Image extends sequelize_1.Model {
}
Image.init({
    src: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    type: sequelize_1.DataTypes.STRING(20),
}, {
    modelName: "image",
    tableName: "images",
    charset: "utf8",
    collate: "utf8_general_ci",
    paranoid: true,
    sequelize: sequelize_2.default,
});
function associate(db) {
    db.Image.belongsTo(db.Tweet);
}
exports.associate = associate;
exports.default = Image;
