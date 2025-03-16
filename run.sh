#!/bin/bash

# Check if .env file exists, if not create it from environment variables or prompt
if [ ! -f .env ]; then
  echo "Creating .env file..."
  
  # Set PORT with default value if not provided
  PORT=${PORT:-3000}
  echo "PORT=$PORT" >> .env
  
  # Prompt for API_KEY if not set in environment
  if [ -z "$API_KEY" ]; then
    read -p "Enter YouTube API Key: " API_KEY
  fi
  echo "API_KEY=$API_KEY" >> .env
  
  # Prompt for YOUTUBE_CHANNEL_ID if not set in environment
  if [ -z "$YOUTUBE_CHANNEL_ID" ]; then
    read -p "Enter YouTube Channel ID: " YOUTUBE_CHANNEL_ID
  fi
  echo "YOUTUBE_CHANNEL_ID=$YOUTUBE_CHANNEL_ID" >> .env
fi

# Start the services
docker-compose up -d