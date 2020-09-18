const Sequelize = require("sequelize");
const { Model } = Sequelize;

module.exports = class User extends Model {
  static init(sequelize) {
    return super.init(
      {
        nickname: {
          type: Sequelize.STRING(30),
          allowNull: false,
          unique: true
        },
        email: {
          type: Sequelize.STRING(30),
          allowNull: false,
          unique: true
        },
        password: {
          type: Sequelize.STRING(30),
          allowNull: false
        },
        loginType: {
          type: Sequelize.STRING(10),
          defaultValue: "local",
          allowNull: false
        },
        snsId: {
          type: Sequelize.STRING(30)
        },
        selfIntro: {
          type: Sequelize.STRING(100)
        },
        location: {
          type: Sequelize.STRING(20)
        },
        avatarURL: {
          type: Sequelize.STRING,
          allowNull: false
        }
      },
      {
        modelName: "user",
        tableName: "users",
        charset: "utf8",
        collate: "utf8_general_ci",
        paranoid: true,
        sequelize
      }
    );
  }

  static associate(db) {
    db.User.hasMany(db.Tweet);
    db.User.belongsToMany(db.Tweet, { through: "likes", as: "liked" });
    db.User.belongsToMany(db.User, {
      through: "follows",
      as: "followers",
      foreighKey: "followingId"
    });
    db.User.belongsToMany(db.User, {
      through: "follows",
      as: "followings",
      foreighKey: "followerId"
    });
  }
};
