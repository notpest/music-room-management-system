// models/Equipment.ts
import { Model, DataTypes } from "sequelize";
import sequelize from "../database";

class Equipment extends Model {}

Equipment.init(
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    equipment_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Equipment",
    tableName: "equipment",
    timestamps: false,
  }
);

export default Equipment;
