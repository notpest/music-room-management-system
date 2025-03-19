// models/Equipment.ts
import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../database";

interface EquipmentAttributes {
  id: string;
  equipment_name: string;
  category: string;
  quantity: number;
  created_date: Date;
}

interface EquipmentCreationAttributes
  extends Optional<EquipmentAttributes, "id" | "created_date"> {}

class Equipment
  extends Model<EquipmentAttributes, EquipmentCreationAttributes>
  implements EquipmentAttributes {
  public id!: string;
  public equipment_name!: string;
  public category!: string;
  public quantity!: number;
  public created_date!: Date;
}

Equipment.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    equipment_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    created_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
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
