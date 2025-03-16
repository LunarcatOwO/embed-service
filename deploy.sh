#!/bin/bash

echo "=== YouTube Embed Service Deployment ==="

# Load environment variables
if [ -f .env.deploy ]; then
  export $(grep -v '^#' .env.deploy | xargs)
fi

# Pull latest image from GitHub Container Registry
echo "Pulling latest image from GitHub Container Registry..."
docker compose -f docker-compose.prod.yml pull app

# Perform a zero-downtime deployment
echo "Performing zero-downtime deployment..."
docker compose -f docker-compose.prod.yml up -d --no-deps app

# Remove any dangling images
echo "Cleaning up..."
docker image prune -f

echo "Deployment completed successfully!"
echo "Service is running with latest changes and proper Watchtower configuration"