// database.ts
import { Sequelize } from 'sequelize';
import * as pg from "pg";

const sequelize = new Sequelize('music_room', 'postgres', 'admin', {
  host: 'localhost',
  dialect: 'postgres',
  dialectModule: pg,
});

export default sequelize;