// models/Request.ts
import { Model, DataTypes } from 'sequelize';
import sequelize from '../database';
import User from './User';
import Slot from './Slot';

class Request extends Model {}

Request.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id',
    },
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  slot_start: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  slot_end: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  sequelize,
  modelName: 'Request',
});

export default Request;