import dotenv from "dotenv";

dotenv.config();

const ENVIRONTMENT = {
  MONGO_DB_CONNECTION_STRING: process.env.MONGO_DB_CONNECTION_STRING,
  PORT: process.env.PORT,
  MAIL_EMAIL: process.env.MAIL_EMAIL,
  MAIL_PASSWORD: process.env.MAIL_PASSWORD,
  URL_FRONTEND: process.env.URL_FRONTEND,
  URL_BACKEND: process.env.URL_BACKEND,
  JWT_SECRET_KEY: process.env.JWT_SECRET_KEY,
};

export default ENVIRONTMENT;
