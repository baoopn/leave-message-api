import dotenv from 'dotenv';
dotenv.config();

const EMAIL_USER = process.env.EMAIL_USER || 'default_email';
const PASSWORD = process.env.PASSWORD || 'default_password';
const EMAIL_FROM = process.env.EMAIL_FROM || 'default_email';

export { EMAIL_USER, PASSWORD, EMAIL_FROM };