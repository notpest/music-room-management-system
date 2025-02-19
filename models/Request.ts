// models/Request.ts
import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../database";
import User from "./User";

// Attributes for a Request
interface RequestAttributes {
  id: string;
  user_id: string;
  status: "approved" | "denied" | "pending";
  slot_start: Date;
  slot_end: Date;
  request_date: Date;
  response_date: Date | null;
}

// When creating a new Request, these fields will be optional.
interface RequestCreationAttributes extends Optional<RequestAttributes, "id" | "request_date" | "response_date"> {}

class Request extends Model<RequestAttributes, RequestCreationAttributes> implements RequestAttributes {
  public id!: string;
  public user_id!: string;
  public status!: "approved" | "denied" | "pending";
  public slot_start!: Date;
  public slot_end!: Date;
  public request_date!: Date;
  public response_date!: Date | null;
}

Request.init(
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
