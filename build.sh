#!/bin/bash

# Function to handle errors
handle_error() {
    echo "Error occurred in command: $1"
    exit 1
}

handle_error_not_exit() {
    echo "Error occurred in command: $1"
}

# Rebuild and start the container
docker compose up -d --build || handle_error "sudo docker-compose up -d --build"

# Remove dangling images
docker image prune -f || handle_error "sudo docker image prune -f"

echo "Container has been successfully rebuilt and started."