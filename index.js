import express from 'express';
import bodyParser from 'body-parser';
import nodemailer from 'nodemailer';
import cors from 'cors';
import { EMAIL_USER, EMAIL_FROM, PASSWORD } from './constants.js';

const app = express();
const port = 3000;

// List of allowed origins
const allowedOrigins = [
    'https://example1.com',
	'https://example2.com'
];

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

// GET endpoint for documentation
app.get('/', (req, res) => {
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
            }
        }
    });
});


// POST endpoint /msg
app.post('/msg', async (req, res) => {
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
        console.log(`Email sent successfully. Timestamp: ${new Date().toISOString()}`);
        res.status(200).json({ success: 'Email sent successfully' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ error: 'Failed to send email' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
