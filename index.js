import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import xss from "xss-clean";
import timeout from "connect-timeout";
import rateLimit from "express-rate-limit";
import fetch from "node-fetch";
import path from "path";
import nodemailer from "nodemailer";
import { fileURLToPath } from "url";
import {
  ALLOWED_ORIGINS,
  PORT,
  TELEGRAM_BOT_TOKEN,
  EMAIL_FROM,
  EMAIL_USER,
  PASSWORD,
} from "./constants.js";

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = PORT;

// Get allowed origins from environment variable
const allowedOrigins =
  ALLOWED_ORIGINS === "*"
    ? "*"
    : ALLOWED_ORIGINS
      ? ALLOWED_ORIGINS.split(",")
      : [];
console.log("Allowed origins:", allowedOrigins);

// CORS options
const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins === "*" || allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};

// Middleware
app.use(bodyParser.json());
app.use(cors(corsOptions)); // Enable CORS for specific origins
app.use(xss()); // Protect from XSS attacks
app.use(timeout("10s")); // Set a timeout of 10 seconds

// Middleware to handle timeout
function haltOnTimedout(req, res, next) {
  if (!req.timedout) next();
}

// Middleware to check the Referer header
const refererCheck = (req, res, next) => {
  const referer = req.get("Referer");

  // Do not allow requests without a Referer (no curl/cli requests)
  if (!referer) {
    return res.status(403).json({ error: "Referer not allowed" });
  }

  let origin;
  try {
    origin = new URL(referer).origin;
  } catch (e) {
    return res.status(403).json({ error: "Referer not allowed" });
  }

  // `allowedOrigins` is either "*" or an array (see initialization above)
  if (
    allowedOrigins === "*" ||
    (Array.isArray(allowedOrigins) &&
      allowedOrigins.map((o) => o.trim()).includes(origin))
  ) {
    return next();
  }

  return res.status(403).json({ error: "Referer not allowed" });
};

// Rate limiting middleware
const apiLimiter = rateLimit({
  windowMs: 2 * 60 * 1000, // 2 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  handler: (req, res) => {
    res
      .status(429)
      .json({ error: "Too many requests, please try again after 2 minutes" });
  },
});

// Global email rate limiter - 50 emails per day
const emailLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 50, // limit to 50 emails per day globally
  keyGenerator: () => "global", // Use same key for all requests to make it global
  handler: (req, res) => {
    res
      .status(429)
      .json({ error: "Daily email limit reached. Please try again tomorrow." });
  },
});

// Serve static files from the /static directory
app.use(express.static(path.join(__dirname, "static")));

// GET endpoint for documentation
app.get("/", haltOnTimedout, (req, res) => {
  res.sendFile(path.join(__dirname, "static", "index.html"));
});

// Healthcheck endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// POST endpoint /msg for sending messages via email
app.post(
  "/msg",
  apiLimiter,
  emailLimiter,
  haltOnTimedout,
  refererCheck,
  async (req, res) => {
    let { subject, email, message, address_to, name } = req.body;

    if (!email || !message || !address_to || !name) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (!email.includes("@") || !email.includes(".")) {
      return res.status(400).json({ error: "Invalid email address" });
    }

    if (!address_to.includes("@") || !address_to.includes(".")) {
      return res.status(400).json({ error: "Invalid recipient email address" });
    }

    if (!subject) {
      subject = "(No Subject)";
    }

    // Create a transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: EMAIL_USER,
        pass: PASSWORD,
      },
    });

    // Construct request URL
    const requestUrl =
      req.get("Referer") ||
      `${req.protocol}://${req.get("host")}${req.originalUrl}`;

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
      console.log(
        `Email sent successfully from ${requestUrl}. Timestamp: ${new Date().toISOString()}`,
      );
      res.status(200).json({ success: "Email sent successfully" });
    } catch (error) {
      console.error("Error sending email:", error);
      res.status(500).json({ error: "Failed to send email" });
    }
  },
);

// POST endpoint /msg/telegram for sending via Telegram
app.post("/msg/telegram", apiLimiter, haltOnTimedout, async (req, res) => {
  let { subject, email, message, name, chatId } = req.body;
  // Construct request URL
  const requestUrl =
    req.get("Referer") ||
    `${req.protocol}://${req.get("host")}${req.originalUrl}`;

  if (!email || !message || !name) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  if (!email.includes("@") || !email.includes(".")) {
    return res.status(400).json({ error: "Invalid email address" });
  }

  if (!subject) {
    subject = "(No Subject)";
  }

  // Function to escape special characters for Telegram MarkdownV2
  const escapeMarkdown = (text) => {
    return text.replace(/([_*\[\]()~`>#+\-=|{}.!])/g, "\\$1");
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
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: telegramMessage,
          parse_mode: "MarkdownV2",
        }),
      },
    );

    if (response.ok) {
      console.log(
        `[${new Date().toISOString()}] Telegram message sent successfully. From: ${requestUrl}.`,
      );
      res.status(200).json({ success: "Telegram message sent successfully" });
    } else {
      throw new Error(`Failed to send Telegram message.`);
    }
  } catch (error) {
    console.error(
      `[${new Date().toISOString()}] Error sending Telegram message:`,
      error,
    );
    res.status(500).json({ error: "Failed to send Telegram message" });
  }
});

// Middleware to handle 404 errors
app.use((req, res, next) => {
  res.status(404).sendFile(path.join(__dirname, "404", "404.html"));
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
