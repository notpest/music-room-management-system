// models/Slot.ts
import { Model, DataTypes } from 'sequelize';
import sequelize from '../database';
import Band from './Band';

class Slot extends Model {
  public id!: number;
  public slot_start!: Date;
  public slot_end!: Date;
  public status!: string; // Define the status property
  public band_id!: number;
  public Band?: Band;
}

Slot.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'available',
    },
    band_id: {
      type: DataTypes.INTEGER,
      references: {
        model: Band,
        key: 'id',
      },
    },
    slot_start: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    slot_end: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Slot',
    tableName: 'slot',
    timestamps: false,
  }
);

Slot.belongsTo(Band, { foreignKey: 'band_id' });
export default Slot;
