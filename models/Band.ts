import { Model, DataTypes } from 'sequelize';
import sequelize from '../database';
import User from "./User";

interface BandAttributes {
  id: number;
  name: string;
}

class Band extends Model<BandAttributes> implements BandAttributes {
  public id!: number;
  public name!: string;
}

Band.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  sequelize,
  modelName: 'Band',
  tableName: 'band',
  timestamps: false,
});

export default Band;