const { DataTypes, Model } = require("sequelize");

module.exports = class Post extends Model {
  static init(sequelize) {
    return super.init(
      {
        contents: {
          type: DataTypes.STRING(200),
          allowNull: false
        },
        hasMedia: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false
        }
      },
      {
        modelName: "tweet",
        tableName: "tweets",
        charset: "utf8mb4",
        collate: "utf8mb4_general_ci",
        paranoid: true,
        sequelize
      }
    );
  }

  static associate(db) {
    db.Tweet.belongsTo(db.User);
    db.Tweet.belongsTo(db.Tweet);
    db.Tweet.hasMany(db.Tweet, {
      as: "retweets",
      foreignKey: "retweetOriginId"
    });
    db.Tweet.belongsToMany(db.User, { through: "likes", as: "likers" });
    db.Tweet.belongsToMany(db.Hashtag, { through: "tweetHashtag" });
    db.Tweet.hasMany(db.Image);
  }
};
