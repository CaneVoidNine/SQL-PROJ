import { Sequelize } from "sequelize";

const { PG_DB, PG_USER, PG_PASSWORD, PG_HOST, PG_PORT } = process.env;

const sequelize = new Sequelize(PG_DB, PG_USER, PG_PASSWORD, {
  host: PG_HOST,
  port: PG_PORT,
  dialect: "postgres",
});

export const pgConnect = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connected to Postgres!");
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

export const syncModels = async () => {
  await sequelize.sync();
  console.log("All tables are syncd");
};

export default sequelize;
