import * as dotenv from 'dotenv';

dotenv.config();

const { env } = process;

export const config = {
  nodeEnv: env.NODE_ENV,
  jwt: {
    expiresIn: env.JWT_EXPIRES_IN ?? '1d',
    forgotExpiresIn: env.JWT_FORGOT_EXPIRES_IN ?? '1d',
    forgotSecret: env.JWT_FORGOT_SECRET,
    refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN ?? '10d',
    refreshSecret: env.JWT_REFRESH_SECRET,
    secret: env.JWT_SECRET,
  },
  redis: {
    host: env.REDIS_HOST ?? '127.0.0.1',
    max: env.REDIS_MAX_ITEM ?? 10000,
    port: env.REDIS_PORT ?? 6379,
    ttl: env.REDIS_TTL ?? '86400',
  },
  server: {
    host: env.SERVER_HOST ?? '127.0.0.1',
    hostname: env.SERVER_HOST_NAME ?? '127.0.0.1:3000',
    port: env.SERVER_PORT ?? '3000',
    schema: env.SERVER_SCHEMA ?? 'http',
    swaggerBasicAuthUsername: env.SERVER_SWAGGER_BASIC_AUTH_USERNAME ?? 'vth1',
    swaggerBasicAuthPass: env.SERVER_SWAGGER_BASIC_AUTH_PASS ?? '12022001',
    swaggerSchema: env.SERVER_SWAGGER_SCHEMA,
  },
  service: {
    apiVersion: env.SERVICE_API_VERSION ?? '0.0.1',
    appVersion: env.SERVICE_APP_VERSION ?? '0.0.1',
    baseUrl: env.SERVICE_BASE_URL ?? '/api/fs',
    description: env.SERVICE_DESCRIPTION ?? 'fs',
    docsBaseUrl: env.SERVICE_DOCS_BASE_URL ?? '/docs/fs',
    name: env.SERVICE_NAME ?? 'fs',
  },
  mongoUri: env.MONGO_DB_URI,
  root: {
    email: env.ROOT_USER_EMAIL ?? 'vuthihuong@gmail.com',
    password: env.ROOT_USER_PASSWORD ?? 'vuthihuong',
    phoneNumber: env.ROOT_USER_PHONENUMBER ?? '082726123',
  },
  mail: {
    admin: env.MAIL_ADMIN,
    defaultEmail: env.MAIL_DEFAULT_EMAIL,
    defaultName: env.MAIL_DEFAULT_NAME,
    host: env.MAIL_HOST,
    ignoreTLS: env.MAIL_IGNORE_TLS,
    password: env.MAIL_PASSWORD,
    port: env.MAIL_PORT,
    requireTLS: env.MAIL_REQUIRE_TLS,
    secure: env.MAIL_SECURE,
    user: env.MAIL_USER,
  },
  client: {
    frontendUrl: env.CLIENT_FE_URL,
  },
  cloudinary: {
    cloudName: env.CLOUDINARY_CLOUD_NAME,
    apiKey: env.CLOUDINARY_API_KEY,
    apiSecret: env.CLOUDINARY_API_SECRET,
  },
  vietQR: {
    clientId: env.VIETQR_CLIENT_ID,
    apiKey: env.VIETQR_API_KEY,
    baseUrl: env.VIETQR_BASE_URL ?? 'https://api.vietqr.io/v2/generate',
  },
  security: {
    key: env.SECURITY_KEY ?? '',
  },
  payment: {
    term: env.PAYMENT_TERM ?? Number(15),
  },
};
