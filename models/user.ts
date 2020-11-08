import {
  Model,
  DataTypes,
  BelongsToManyAddAssociationMixin,
  BelongsToManyRemoveAssociationMixin,
  BelongsToManyGetAssociationsMixin,
} from "sequelize";
import sequelize from "./sequelize";
import Tweet from "./tweet";
import { dbType } from "./index";

class User extends Model {
  public id!: number;
  public nickname!: string;
  public email!: string;
  public password!: string;
  public loginType!: string;
  public avatarURL!: string;
  public snsId?: string;
  public selfIntro?: string;
  public location?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt?: Date;

  public readonly favorites?: Tweet[];

  public addFollower!: BelongsToManyAddAssociationMixin<User, number>;
  public removeFollower!: BelongsToManyRemoveAssociationMixin<User, number>;
  public getFollowings!: BelongsToManyGetAssociationsMixin<User>;
  public getFollowers!: BelongsToManyGetAssociationsMixin<User>;
}

User.init(
  {
    nickname: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    loginType: {
      type: DataTypes.STRING(10),
      defaultValue: "local",
      allowNull: false,
    },
    avatarURL: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    snsId: DataTypes.STRING(30),
    selfIntro: DataTypes.STRING(100),
    location: DataTypes.STRING(20),
  },
  {
    modelName: "user",
    tableName: "users",
    charset: "utf8",
    collate: "utf8_general_ci",
    paranoid: true,
    sequelize,
  }
);

export function associate(db: dbType) {
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

export default User;
