#!/bin/bash

# Load environment variables
if [ -f .env.deploy ]; then
  export $(grep -v '^#' .env.deploy | xargs)
fi

# Pull latest code
git pull origin main

# Build new image with a temporary tag
docker build -t youtube-embed-service:new .

# Stop and remove the old container gracefully
docker-compose stop app

# Tag the new image as latest
docker tag youtube-embed-service:new youtube-embed-service:latest

# Start the new container
docker-compose up -d app

# Remove the temporary tag
docker rmi youtube-embed-service:new