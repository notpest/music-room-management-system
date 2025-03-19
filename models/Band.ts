import { Model, DataTypes } from 'sequelize';
import sequelize from '../database';

interface BandAttributes {
  id?: string;
  name: string;
  created_date?: Date;
  colour: string;
}

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
