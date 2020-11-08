import {
  DataTypes,
  Model,
  BelongsToManyAddAssociationsMixin,
  BelongsToManyAddAssociationMixin,
  BelongsToManyRemoveAssociationMixin,
  BelongsToManyRemoveAssociationsMixin,
  BelongsToManyGetAssociationsMixin,
  BelongsToManySetAssociationsMixin,
} from "sequelize";
import Hashtag from "./hashtag";
import { dbType } from "./index";
import sequelize from "./sequelize";

class Tweet extends Model {
  public id!: number;
  public contents!: string;
  public hasMedia!: boolean;
  public retweetedCount!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt?: Date;

  public quotedOriginId?: number; // out of table
  public count?: number; // out of table

  public getChoosers!: BelongsToManyGetAssociationsMixin<Tweet>;
  public addChooser!: BelongsToManyAddAssociationMixin<Tweet, number>;
  public setChoosers!: BelongsToManySetAssociationsMixin<Tweet, []>;
  public removeChooser!: BelongsToManyRemoveAssociationMixin<Tweet, number>;
  public getLikers!: BelongsToManyGetAssociationsMixin<Tweet>;
  public addHashtags!: BelongsToManyAddAssociationsMixin<Tweet, string>;
  public getHashtags!: BelongsToManyGetAssociationsMixin<Tweet>;
  public addLiker!: BelongsToManyAddAssociationMixin<Tweet, number>;
  public removeLiker!: BelongsToManyRemoveAssociationMixin<Tweet, number>;
  public addWriter!: BelongsToManyAddAssociationMixin<Tweet, number>;
  public removeWriter!: BelongsToManyRemoveAssociationMixin<Tweet, number>;
  public removeHashtagTweet!: BelongsToManyRemoveAssociationMixin<
    Hashtag,
    number
  >;
}

Tweet.init(
  {
    contents: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    hasMedia: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    retweetedCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    modelName: "tweet",
    tableName: "tweets",
    charset: "utf8mb4",
    collate: "utf8mb4_general_ci",
    paranoid: true,
    sequelize,
  }
);

export function associate(db: dbType) {
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
    as: "choosers", // 해당 원본 트윗을 리트윗한 사람
  });
  db.Tweet.belongsToMany(db.User, {
    through: "userQuotedTweets",
    as: "writers", // 해당 원본 트윗을 인용한 사람
  });
}

export default Tweet;
