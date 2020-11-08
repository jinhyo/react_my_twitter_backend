import { Model, DataTypes } from "sequelize";
import sequelize from "./sequelize";
import { dbType } from "./index";

class Hashtag extends Model {
  public id!: number;
  public tag!: string;
  public count!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt?: Date;
}

Hashtag.init(
  {
    tag: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
  },
  {
    modelName: "hashtag",
    tableName: "hashtags",
    charset: "utf8mb4",
    collate: "utf8mb4_general_ci",
    paranoid: true,
    sequelize,
  }
);

export function associate(db: dbType) {
  db.Hashtag.belongsToMany(db.Tweet, {
    through: "tweetHashtags",
    as: "hashtagTweets",
  });
}

export default Hashtag;
