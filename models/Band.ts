import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../database';
import User from './User';
import UserBand from './UserBand';

interface BandAttributes {
  id?: string;
  name: string;
  created_date?: Date;
  colour: string;
}

interface BandCreationAttributes extends Optional<BandAttributes, "id" | "created_date"> {}

class Band extends Model<BandAttributes> implements BandAttributes {
  public id!: string;
  public name!: string;
  public created_date!: Date;
  public colour!: string;
}

Band.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    created_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    colour: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Band',
    tableName: 'band',
    timestamps: false,
  }
);

export default Band;
