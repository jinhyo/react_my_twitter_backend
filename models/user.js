const Sequelize = require("sequelize");
const { Model } = Sequelize;

module.exports = class User extends Model {
  static init(sequelize) {
    return super.init(
      {
        nickname: {
          type: Sequelize.STRING(50),
          allowNull: false,
          unique: true
        },
        email: {
          type: Sequelize.STRING(30),
          allowNull: false
        },
        password: {
          type: Sequelize.STRING(100),
          allowNull: false
        },
        loginType: {
          type: Sequelize.STRING(10),
          defaultValue: "local",
          allowNull: false
        },
        avatarURL: {
          type: Sequelize.STRING,
          allowNull: false
        },
        snsId: Sequelize.STRING(30),
        selfIntro: Sequelize.STRING(100),
        location: Sequelize.STRING(20)
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
