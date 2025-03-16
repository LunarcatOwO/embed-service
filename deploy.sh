#!/bin/bash

echo "=== YouTube Embed Service Deployment ==="

# Load environment variables
if [ -f .env.deploy ]; then
  export $(grep -v '^#' .env.deploy | xargs)
fi

# Pull latest code from repository
echo "Pulling latest code from repository..."
git pull origin main

# Build the updated image using docker-compose
# This preserves all labels and configuration from docker-compose.yml
echo "Building new image..."
sudo docker compose build app

# Perform a zero-downtime deployment
echo "Performing zero-downtime deployment..."
sudo docker compose up -d --no-deps app

# Remove any dangling images
echo "Cleaning up..."
sudo docker image prune -f

echo "Deployment completed successfully!"
echo "Service is running with latest changes and proper Watchtower configuration"

# Optional: Show running containers
sudo docker compose ps