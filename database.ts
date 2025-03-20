// database.ts
import { Sequelize } from 'sequelize';
import pg from 'pg';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}
console.log("DATABASE_URL:", connectionString);

const sequelize = new Sequelize(connectionString, {
  dialect: "postgres",
  dialectModule: pg,
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

// Test the connection
sequelize.authenticate()
  .then(() => console.log("Database connection established successfully"))
  .catch((err) => console.error("Error connecting to the database:", err));

export default sequelize;
