import dotenv from 'dotenv';
dotenv.config();

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || 'default_telegram_bot_token';
const PORT = 3000;
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS : '*';

const EMAIL_FROM = process.env.EMAIL_FROM;
const EMAIL_USER = process.env.EMAIL_USER;
const PASSWORD = process.env.PASSWORD;

export { TELEGRAM_BOT_TOKEN, PORT, ALLOWED_ORIGINS, EMAIL_FROM, EMAIL_USER, PASSWORD };