const { DataTypes, Model } = require("sequelize");

module.exports = class Image extends Model {
  static init(sequelize) {
    return super.init(
      {
        src: {
          type: DataTypes.STRING,
          allowNull: false
        },
        type: DataTypes.STRING(20)
      },
      {
        modelName: "image",
        tableName: "images",
        charset: "utf8",
        collate: "utf8_general_ci",
        paranoid: true,
        sequelize
      }
    );
  }

  static associate(db) {
    db.Image.belongsTo(db.Tweet);
  }
};
