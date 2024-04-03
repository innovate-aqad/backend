import { config } from "dotenv";

config();
const envVars = process.env;
export const environmentVars = {
  port: envVars.PORT || 2000,
  nodeEnv: envVars.NODE_ENV || "development",
  host: envVars.HOST || "localhost",
  dbName: envVars.DATABASE,
  dbPort: envVars.DB_PORT || 3306,
  dbUser: envVars.DB_USER || "root",
  dbPass: envVars.DB_PASS || "",
  socketPath: envVars.SOCKET_PATH,
  appUrl: envVars.APP_URL || "http://localhost:3000",
  baseUrl: envVars.BASE_URL || "/api/v1/",
  jwtSecret: envVars.JWT_SECRET,
  jwtSecretAdmin: envVars.JWT_SECRET_FOR_ADMIN,
  salt: envVars.SALT,
  secret: envVars.SECRET,
  authEmail: envVars.AUTH_EMAIL,
  authPass: envVars.AUTH_PASS,
  mailService: envVars.MAIL_SERVICE,
  smtpUser: envVars.SMTP_USER,
  smtpPass: envVars.SMTP_PASS,
  stripe_secret_key: envVars.STRIPE_SECRET_KEY,
  live_url: envVars?.LIVE_URL,
};
