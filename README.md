# Leave Message API

This Express.js application is a contact form backend that processes POST requests to the /msg endpoint. It validates input data, allows cross-origin requests from specific origins, and sends an email containing the message details using Gmail's SMTP server. The app ensures secure and efficient handling of contact form submissions, providing real-time email notifications to the specified recipient.

Additionally, the application includes a POST endpoint `/msg/telegram` for sending messages via Telegram. It validates the input data, constructs a formatted message using Telegram MarkdownV2, and sends the message to the specified Telegram chat ID using the Telegram Bot API.

## Features

- Send messages via email
- Capture and include the URL of the page making the request in the email
- CORS enabled

## Prerequisites

- Node.js
- npm (Node Package Manager)

## Installation

1. Clone the repository:

	```sh
	git clone https://github.com/baoopn/leave-message-api.git
	cd leave-message-api
	```

2. Install the dependencies:

	```sh
	npm install
	```

3. Create a `.env` file in the root directory and add your email credentials:

	```env
	EMAIL_USER=your-email@gmail.com
	EMAIL_FROM=your-email@gmail.com
	PASSWORD=your-email-password
 	TELEGRAM_BOT_TOKEN=your-telegram-bot-token
 	PORT=3000 (or any other port)
 	ALLOWED_ORIGINS=your-allowed-origins-list (comma-separated without spaces)
	```

## Usage

1. Start the server:

	```sh
	npm start
	```

2. The server will run at `http://localhost:3000`.

3. Send a POST request to `http://localhost:3000/msg` with the following JSON payload:

	```json
	{
		"name": "Sender Name",
		"email": "sender@example.com",
		"subject": "Message Subject",
		"message": "Hello, this is a test message.",
		"address_to": "recipient@example.com"
	}
	```
 
4. Send a POST request to `http://localhost:3000/msg/telegram` with the following JSON payload:

	```json
	{
		"name": "Sender Name",
		"email": "sender@example.com",
		"subject": "Message Subject",
		"message": "Hello, this is a test message.",
 		"chatId": "your-telegram-chat-id"
 	}
 	```

## Endpoints

### POST /msg

Send a message via email.

#### Request Body
- `name` (string, required): The sender's name.
- `email` (string, required): The sender's email address.
- `subject` (string, optional): The subject of the message.
- `message` (string, required): The message content.
- `address_to` (string, required): The recipient's email address.

#### Response

- `200 OK`: Email sent successfully.
- `400 Bad Request`: Missing required fields.
- `500 Internal Server Error`: Failed to send email.

### POST /msg/telegram

Send a message via Telegram.

#### Request Body
- `name` (string, required): The sender's name.
- `email` (string, required): The sender's email address.
- `subject` (string, optional): The subject of the message.
- `message` (string, required): The message content.
- `chatId` (string, required): The Telegram chat ID to send the message to.

#### Response

- `200 OK`: Telegram message sent successfully.
- `400 Bad Request`: Missing required fields or invalid email address.
- `500 Internal Server Error`: Failed to send Telegram message.

## Production Deployment Using Docker

1. Build the Docker image:

	```sh
	sudo docker build -t leave-msg-app .
	```

2. Run the Docker container with docker-compose.yml:

	```sh
	docker-compose up -d --build
	```
 	or if you have compose installed as a Docker CLI plugin:

	```sh
 	docker compose up -d --build
	```

3. The server will run at `http://localhost:3000` or the port specified in the `.env` file.

## Build and Run Script

You have the option to build and run the Docker container using the provided script `build.sh`.

1. Make the script executable:

	```sh
	chmod +x build.sh
	```
 
2. Run the script:

	```sh
 	./build.sh
	```
 
3. The script will build the Docker image and run the container with the settings specified in `docker-compose.yml`.
4. You can run `build.sh` to rebuild the image and restart the container with the new changes and remove the redundant images.

## Contact
For any questions or to use this API in your application, please contact me at [info@baoopn.com](mailto:info@baoopn.com).

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.