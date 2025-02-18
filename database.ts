// database.ts
import { Sequelize } from 'sequelize';

const sequelize = new Sequelize('music_room', 'postgres', 'admin', {
  host: 'localhost',
  dialect: 'postgres',
});

export default sequelize;