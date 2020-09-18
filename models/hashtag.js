const Sequelize = require("sequelize");
const { Model } = Sequelize;

module.exports = class Hashtag extends Model {
  static init(sequelize) {
    return super.init(
      {
        tag: {
          type: Sequelize.STRING(30),
          allowNull: false
        }
      },
      {
        modelName: "hashtag",
        tableName: "hashtags",
        charset: "utf8mb4",
        collate: "utf8mb4_general_ci",
        paranoid: true,
        sequelize
      }
    );
  }

  static associate(db) {
    db.Hashtag.belongsToMany(db.Tweet, { through: "tweetHashtag" });
  }
};
