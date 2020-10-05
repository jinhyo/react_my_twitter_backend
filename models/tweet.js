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
        },
        retweetedCount: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0
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
    db.Tweet.belongsTo(db.Tweet, {
      as: "retweetOrigin",
      foreignKey: "retweetOriginId"
    });
    db.Tweet.belongsTo(db.Tweet, {
      as: "quotedOrigin",
      foreignKey: "quotedOriginId"
    });

    db.Tweet.belongsTo(db.Tweet, {
      as: "commentedOrigin",
      foreignKey: "commentedOriginId"
    });
    db.Tweet.hasMany(db.Tweet, {
      as: "comments",
      foreignKey: "commentedOriginId"
    });

    db.Tweet.belongsToMany(db.User, { through: "likes", as: "likers" });
    db.Tweet.belongsToMany(db.Hashtag, { through: "tweetHashtags" });
    db.Tweet.hasMany(db.Image);
    db.Tweet.belongsToMany(db.User, {
      through: "userRetweets",
      as: "choosers" // 해당 원본 트윗을 리트윗한 사람
    });
    db.Tweet.belongsToMany(db.User, {
      through: "userQuotedTweets",
      as: "writers" // 해당 원본 트윗을 리트윗한 사람
    });
  }
};
