import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import xss from 'xss-clean';
import timeout from 'connect-timeout';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';
import { ALLOWED_ORIGINS, PORT, TELEGRAM_BOT_TOKEN } from './constants.js';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = PORT;

// Get allowed origins from environment variable
const allowedOrigins = ALLOWED_ORIGINS === '*' ? '*' : (ALLOWED_ORIGINS ? ALLOWED_ORIGINS.split(',') : []);
console.log('Allowed origins:', allowedOrigins);

// CORS options
const corsOptions = {
    origin: (origin, callback) => {
        if (allowedOrigins === '*' || allowedOrigins.includes(origin) || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
};

// Middleware
app.use(bodyParser.json());
app.use(cors(corsOptions)); // Enable CORS for specific origins
app.use(xss()); // Protect from XSS attacks
app.use(timeout('10s')); // Set a timeout of 10 seconds

// Middleware to handle timeout
function haltOnTimedout(req, res, next) {
    if (!req.timedout) next();
}

// Serve static files from the /static directory
app.use(express.static(path.join(__dirname, 'static')));

// GET endpoint for documentation
app.get('/', haltOnTimedout, (req, res) => {
    res.sendFile(path.join(__dirname, 'static', 'index.html'));
});

// POST endpoint /msg/telegram for sending via Telegram
app.post('/msg/telegram', haltOnTimedout, async (req, res) => {
    let { subject, email, message, name, chatId } = req.body;
    // Construct request URL
    const requestUrl = req.get('Referer') || `${req.protocol}://${req.get('host')}${req.originalUrl}`;

    if (!email || !message || !name) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!email.includes('@') || !email.includes('.')) {
        return res.status(400).json({ error: 'Invalid email address' });
    }

    if (!subject) {
        subject = '(No Subject)';
    }

    // Function to escape special characters for Telegram MarkdownV2
    const escapeMarkdown = (text) => {
        return text.replace(/([_*\[\]()~`>#+\-=|{}.!])/g, '\\$1');
    };

    // Construct the Telegram message with Markdown
    const telegramMessage = `
You have received a new message from [${escapeMarkdown(requestUrl)}](${escapeMarkdown(requestUrl)}/):

    *Name:* ${escapeMarkdown(name)}
    *Email:* ${escapeMarkdown(email)}
    *Subject:* ${escapeMarkdown(subject)}

*Message:*
${escapeMarkdown(message)}
`;

    try {
        // Send message to Telegram
        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: telegramMessage,
                parse_mode: 'MarkdownV2'
            }),
        });

        if (response.ok) {
            console.log(`[${new Date().toISOString()}] Telegram message sent successfully. From: ${requestUrl}.`);
            res.status(200).json({ success: 'Telegram message sent successfully' });
        } else {
            throw new Error(`Failed to send Telegram message.`);
        }
    } catch (error) {
        console.error(`[${new Date().toISOString()}] Error sending Telegram message:`, error);
        res.status(500).json({ error: 'Failed to send Telegram message' });
    }
});

// Middleware to handle 404 errors
app.use((req, res, next) => {
    res.status(404).sendFile(path.join(__dirname, '404', '404.html'));
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});