// models/Request.ts
import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../database";
import User from "./User";
import Slot from "./Slot"; // Ensure Slot model is imported
import Room from "./Room";
import Band from "./Band";

interface RequestAttributes {
  id: string;
  user_id: string;
  status: "approved" | "denied" | "pending";
  slot_start: Date;
  slot_end: Date;
  request_date: Date;
  response_date: Date | null;
  slot_id?: number | null; // New field to track the created slot's id
  room_id: string; // change from number to string (UUID)
  band_id: string | null; // new field for band id (admin can override, otherwise user session band id)
  reason: string | null;
}

interface RequestCreationAttributes extends Optional<RequestAttributes, "id" | "request_date" | "response_date" | "slot_id" | "reason"> {}

class Request extends Model<RequestAttributes, RequestCreationAttributes> implements RequestAttributes {
  public id!: string;
  public user_id!: string;
  public status!: "approved" | "denied" | "pending";
  public slot_start!: Date;
  public slot_end!: Date;
  public request_date!: Date;
  public response_date!: Date | null;
  public slot_id!: number | null;
  public room_id!: string;
  public band_id!: string | null;
  public reason!: string | null;
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
    slot_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Slot,
        key: "id",
      },
    },
    room_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Room,
        key: "id",
      },
    },
    band_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: Band,
        key: "id",
      },
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
    }
  },
  {
    sequelize,
    modelName: "Request",
    tableName: "request",
    timestamps: false,
  }
);

export default Request;
