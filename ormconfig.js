const PROD_PATHS = {
  entities: ["dist/Entity/**/*.js"],
  migrations: ["dist/Migrations/**/*.js"],
  subscribers: ["dist/Subscribers/**/*.js"]
};

const DEV_PATHS = {
  entities: ["src/Entity/**/*.ts"],
  migrations: ["src/Migrations/**/*.ts"],
  subscribers: ["src/Subscribers/**/*.ts"]
};

const isDev = ["development", "test"].includes(process.env.NODE_ENV);

module.exports = {
  type: "mysql",
  url: process.env.DATABASE_URL,
  logging: true,
  ...(isDev ? DEV_PATHS : PROD_PATHS)
};
