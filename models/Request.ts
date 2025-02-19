// models/Request.ts
import { Model, DataTypes } from "sequelize";
import sequelize from "../database";
import User from "./User";

class Request extends Model {}

Request.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    slot_start: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    slot_end: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    request_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    response_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Request",
    tableName: "request",
    timestamps: false,
  }
);

export default Request;
