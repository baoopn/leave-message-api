import dotenv from 'dotenv';
dotenv.config();

const EMAIL_USER = process.env.EMAIL_USER || 'default_email';
const PASSWORD = process.env.PASSWORD || 'default_password';
const EMAIL_FROM = process.env.EMAIL_FROM || 'default_email';
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || 'default_telegram_bot_token';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || 'default_telegram_chat_id';

export { EMAIL_USER, PASSWORD, EMAIL_FROM, TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID };