// models/LoginHistory.ts
import { Model, DataTypes } from "sequelize";
import sequelize from "../database";
import User from "./User";

class LoginHistory extends Model {
  public id!: string;
  public user_id!: string;
  public login_time!: Date;
  public logout_time!: Date | null;
}

LoginHistory.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    login_time: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    logout_time: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "LoginHistory",
    tableName: "login_history",
    timestamps: false,
  }
);

export default LoginHistory;
