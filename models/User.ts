// models/User.ts
import { Model, DataTypes } from "sequelize";
import sequelize from "../database";
import Band from "./Band";

class User extends Model {
  public id!: string;
  public username!: string;
  public name!: string;
  public hashed_password!: string;
  public band_id!: string | null;
  public email!: string;
  public role!: string;
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    hashed_password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    band_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: Band,
        key: "id",
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "user",
    },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "user",
    timestamps: false,
  }
);

export default User;
