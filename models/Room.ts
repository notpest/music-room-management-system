// models/Room.ts
import { Model, DataTypes } from 'sequelize';
import sequelize from '../database';

class Room extends Model {
  public id!: string;         // UUID primary key
  public number!: number;     // e.g., 365 or 366
  public name!: string;       // a descriptive name
}

Room.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    number: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Room',
    tableName: 'room',
    timestamps: false,
  }
);

export default Room;
