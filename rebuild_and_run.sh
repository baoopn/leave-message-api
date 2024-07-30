#!/bin/bash

# Check if all required arguments are provided
if [ $# -ne 3 ]; then
  echo "Usage: $0 <EMAIL_USER> <EMAIL_FROM> <PASSWORD>"
  exit 1
fi

EMAIL_USER=$1
EMAIL_FROM=$2
PASSWORD=$3

# Stop and remove the existing container
sudo docker stop leave-msg-app
sudo docker rm leave-msg-app

# Rebuild the Docker image
sudo docker build -t leave-msg-app .

# Run the new Docker container with the environment variables
sudo docker run -d -p 3000:3000 --name leave-msg-app -e EMAIL_USER=$EMAIL_USER -e EMAIL_FROM=$EMAIL_FROM -e PASSWORD=$PASSWORD leave-msg-app

echo "Container leave-msg-app is running with the provided environment variables."