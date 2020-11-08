import { DataTypes, Model } from "sequelize";
import sequelize from "./sequelize";
import { dbType } from "./index";

class Image extends Model {
  public id!: number;
  public src!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt?: Date;
}

Image.init(
  {
    src: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: DataTypes.STRING(20),
  },
  {
    modelName: "image",
    tableName: "images",
    charset: "utf8",
    collate: "utf8_general_ci",
    paranoid: true,
    sequelize,
  }
);

export function associate(db: dbType) {
  db.Image.belongsTo(db.Tweet);
}

export default Image;
