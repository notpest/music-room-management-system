// models/UserBand.ts
import { Model, DataTypes } from 'sequelize';
import sequelize from '../database';

class UserBand extends Model {
  public id!: string;
  public user_id!: string;
  public band_id!: string;
}

UserBand.init(
  {
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'user',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    band_id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'band',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  },
  {
    sequelize,
    modelName: 'UserBand',
    tableName: 'UserBand',
    timestamps: false,
  }
);

export default UserBand;