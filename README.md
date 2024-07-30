# Leave Message API

This is a simple Express.js application that allows users to send messages via email. The application captures the URL of the page from which the request is sent and includes it in the email.

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
		"email": "sender@example.com",
		"message": "Hello, this is a test message.",
		"address_to": "recipient@example.com",
		"name": "Sender Name"
	}
	```

## Endpoints

### POST /msg

Send a message via email.

#### Request Body

- `email` (string): The sender's email address.
- `message` (string): The message content.
- `address_to` (string): The recipient's email address.
- `name` (string): The sender's name.

#### Response

- `200 OK`: Email sent successfully.
- `400 Bad Request`: Missing required fields.
- `500 Internal Server Error`: Failed to send email.

## Production Deployment Using Docker

1. Build the Docker image:

	```sh
	sudo docker build -t leave-msg-app .
	```

2. Run the Docker container with environment variables:

	```sh
	sudo docker run -d -p 3000:3000 --name leave-msg-app -e EMAIL_USER=your-email@gmail.com -e EMAIL_FROM=your-email@gmail.com -e PASSWORD=your-email-password leave-msg-app
	```

3. The server will run at `http://localhost:3000`.

4. Send a POST request to `http://localhost:3000/msg` with the following JSON payload:

	```json
	{
		"email": "sender@example.com",
		"message": "Hello, this is a test message.",
		"address_to": "recipient@example.com",
		"name": "Sender Name"
	}
	```

## Rebuild and Rerun Using `rebuild_and_rerun.sh`

If you need to rebuild the Docker image and restart the container, you can use the provided `rebuild_and_rerun.sh` script.

1. Make sure the script has execution permissions:

    ```sh
    chmod +x rebuild_and_rerun.sh
    ```

2. Run the script:

    ```sh
    ./rebuild_and_rerun.sh your-login-email@gmail.com your-sender-email@gmail.com your-email-password
    ```

This script will:

- Stop and remove the existing Docker container named `leave-msg-app`.
- Build a new Docker image.
- Run a new Docker container with the updated image.

## License

This project is licensed under the MIT License. See the LICENSE file for details.