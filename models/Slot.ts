// models/Slot.ts
import { Model, DataTypes } from 'sequelize';
import sequelize from '../database';
import Band from './Band';
import Room from './Room';

class Slot extends Model {
  public id!: number;
  public slot_start!: Date;
  public slot_end!: Date;
  public status!: string; // Define the status property
  public band_id!: number;
  public room_id!: string;

  public Band?: Band;
  public Room?: Room;
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
    room_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Room,
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
Slot.belongsTo(Room, { foreignKey: 'room_id' });
export default Slot;
