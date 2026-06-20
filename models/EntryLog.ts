// models/EntryLog.ts
import { Model, DataTypes } from "sequelize";
import sequelize from "../database";
import Equipment from "./Equipment";

class EntryLog extends Model {}

EntryLog.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    equipment_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    scanned_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "EntryLog",
    tableName: "entry_log",
    timestamps: false,
  }
);

export default EntryLog;
