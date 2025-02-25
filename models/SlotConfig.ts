// models/SlotConfig.ts
import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../database';

interface SlotConfigAttributes {
  id: string;
  start_time: string; // stored as a TIME string, e.g. "07:30:00"
  end_time: string;   // stored as a TIME string, e.g. "09:00:00"
  enabled: boolean;
}

interface SlotConfigCreationAttributes extends Optional<SlotConfigAttributes, 'id'> {}

class SlotConfig extends Model<SlotConfigAttributes, SlotConfigCreationAttributes>
  implements SlotConfigAttributes {
  public id!: string;
  public start_time!: string;
  public end_time!: string;
  public enabled!: boolean;
}

SlotConfig.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    start_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    end_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    enabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: 'SlotConfig',
    tableName: 'slot_config',
    timestamps: false,
  }
);

export default SlotConfig;
