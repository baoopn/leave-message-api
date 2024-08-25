import express, { response } from 'express';
import bodyParser from 'body-parser';
import nodemailer from 'nodemailer';
import cors from 'cors';
import xss from 'xss-clean';
import timeout from 'connect-timeout';
import fetch from 'node-fetch'; 
import { EMAIL_USER, EMAIL_FROM, PASSWORD, TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } from './constants.js';
import dotenv from 'dotenv';

// Load environment variables from .env file (for local development)
// dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Get allowed origins from environment variable
const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [];

// CORS options
const corsOptions = {
    origin: (origin, callback) => {
        if (allowedOrigins.includes(origin) || !origin) {
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

// GET endpoint for documentation
app.get('/', haltOnTimedout, (req, res) => {
    res.json({
        message: "Welcome to the Leave Message API",
        description: "This API allows you to send messages via email. Use the POST endpoint to submit your message, and the API will handle the rest.",
        endpoints: {
            postMessage: {
                method: "POST",
                path: "/msg",
                description: "Send a message via email",
                body: {
                    subject: "string (optional) - The subject of the email. If not provided, '(No Subject)' will be used.",
                    email: "string (required) - The email address of the sender. Must be a valid email format.",
                    message: "string (required) - The content of the message to be sent.",
                    address_to: "string (required) - The recipient's email address. Must be a valid email format.",
                    name: "string (required) - The name of the sender."
                },
                exampleRequest: {
                    subject: "Hello",
                    email: "sender@example.com",
                    message: "This is a test message.",
                    address_to: "recipient@example.com",
                    name: "Sender Name"
                },
                exampleResponse: {
                    success: "Email sent successfully"
                },
                errorResponses: {
                    400: [
                        {
                            error: "Missing required fields",
                            description: "One or more required fields are missing from the request body."
                        },
                        {
                            error: "Invalid email address",
                            description: "The provided email address is not in a valid format."
                        }
                    ],
                    500: {
                        error: "Failed to send email",
                        description: "There was an error while attempting to send the email."
                    }
                }
            },
            postMessageTelegram: {
                method: "POST",
                path: "/msg/telegram",
                description: "Send a message via Telegram",
                body: {
                    subject: "string (optional) - The subject of the message. If not provided, '(No Subject)' will be used.",
                    email: "string (required) - The email address of the sender.",
                    message: "string (required) - The content of the message to be sent.",
                    name: "string (required) - The name of the sender."
                },
                exampleRequest: {
                    subject: "Test Subject",
                    email: "sender@example.com",
                    message: "This is a test message for Telegram.",
                    name: "Sender Name"
                },
                exampleResponse: {
                    success: "Telegram message sent successfully"
                },
                errorResponses: {
                    400: [
                        {
                            error: "Missing required fields",
                            description: "One or more required fields are missing from the request body."
                        },
                        {
                            error: "Invalid email address",
                            description: "The provided email address is not in a valid format."
                        }
                    ],
                    500: {
                        error: "Failed to send Telegram message",
                        description: "There was an error while attempting to send the Telegram message."
                    }
                }
            }
        }
    });
});

// POST endpoint /msg
app.post('/msg', haltOnTimedout, async (req, res) => {
    let { subject, email, message, address_to, name } = req.body;

    if (!email || !message || !address_to || !name) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!email.includes('@') || !email.includes('.')) {
        return res.status(400).json({ error: 'Invalid email address' });
    }

    if (!address_to.includes('@') || !address_to.includes('.')) {
        return res.status(400).json({ error: 'Invalid recipient email address' });
    }

    if (!subject) {
        subject = '(No Subject)';
    }

    // Create a transporter
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: EMAIL_USER,
            pass: PASSWORD,
        },
    });

    // Construct request URL
    const requestUrl = req.get('Referer') || `${req.protocol}://${req.get('host')}${req.originalUrl}`;

    // Email options
    const mailOptions = {
        from: EMAIL_FROM,
        to: address_to,
        subject: `New Message from ${requestUrl}`,
        text: `You have received a new message from ${name} (${email}):\n\n${message}\n\nBest regards,\nAdmin`,
        html: `
            <p>You have received a new message from <strong>${name}</strong> (<strong>${email}</strong>):</p>
            <div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0;">
                <p><strong>Subject:</strong> ${subject}</p>
                <p>${message}</p>
            </div>
            <p>Best regards,<br>Admin</p>
            <p>This email is auto-generated. Please do NOT reply.</p>
        `,
    };

    try {
        // Send email
        await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully from ${requestUrl}. Timestamp: ${new Date().toISOString()}`);
        res.status(200).json({ success: 'Email sent successfully' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ error: 'Failed to send email' });
    }
});

// POST endpoint /msg/telegram for sending via Telegram
app.post('/msg/telegram', haltOnTimedout, async (req, res) => {
    let { subject, email, message, name } = req.body;
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
        console.log(telegramMessage);
        // Send message to Telegram
        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: telegramMessage,
                parse_mode: 'MarkdownV2'
            }),
        });

        if (response.ok) {
            console.log(`Telegram message sent successfully. From: ${requestUrl}. Timestamp: ${new Date().toISOString()}`);
            res.status(200).json({ success: 'Telegram message sent successfully' });
        } else {
            throw new Error(`Failed to send Telegram message.`);
        }
    } catch (error) {
        console.error('Error sending Telegram message:', error);
        res.status(500).json({ error: 'Failed to send Telegram message' });
    }
});


// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
