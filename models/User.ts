// models/User.ts
import { Model, DataTypes } from 'sequelize';
import sequelize from '../database';
import Band from './Band';

class User extends Model {}

User.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  band_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Band,
      key: 'id',
    },
  },
}, {
  sequelize,
  modelName: 'User',
});

export default User;