// models/EntryLog.ts
import { Model, DataTypes } from 'sequelize';
import sequelize from '../database';

class EntryLog extends Model {
  public id!: number;
  public equipment_id!: string;
  public scanned_at!: Date;
}

EntryLog.init({
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
    defaultValue: DataTypes.NOW,
  },
}, {
  sequelize,
  modelName: 'EntryLog',
  tableName: 'entry_log',
  timestamps: false,
});

export default EntryLog;
