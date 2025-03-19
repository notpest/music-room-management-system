// database.ts
import { Sequelize } from 'sequelize';
import * as pg from "pg";

const sequelize = new Sequelize(process.env.DATABASE_URL!, {
  dialect: "postgres",
  dialectOptions: {
    ssl: { require: true, rejectUnauthorized: false },
  },
  pool: {
    max: 10, // Limit open connections
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

export default sequelize;