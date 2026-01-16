export default () => ({
  app: {
    port: parseInt(process.env.APP_PORT, 10) || 4000,
    APP_FRONTEND_URL: process.env.APP_FRONTEND_URL,
    APP_ENV: process.env.APP_ENV,
  },
  db: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
  jwt: {
    access: {
      secretKey: process.env.JWT_ACCESS_TOKEN_KEY,
      expiry: parseInt(process.env.JWT_ACCESS_EXPIRY),
    },
    refresh: {
      secretKey: process.env.JWT_REFRESH_TOKEN_KEY,
      expiry: parseInt(process.env.JWT_REFRESH_EXPIRY),
    },
  },
  smtp: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    auth: {
      user: process.env.SMTP_USERNAME,
      password: process.env.SMTP_PASSWORD,
    },
  },
  email: {
    // add more i.e. info email, contact or support etc.
    default: process.env.DEFAULT_EMAIL_FROM,
  },
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    sessionToken: process.env.AWS_SESSION_TOKEN || '',
    region: process.env.AWS_REGION || 'us-east-1',
    bucketName: process.env.AWS_BUCKET_NAME || 'default-bucket',
  },
});
