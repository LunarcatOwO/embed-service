#!/bin/bash

echo "=== YouTube Embed Service Configuration Reset ==="
echo "This will reset all environment configurations."
read -p "Continue? (y/n): " confirm

if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
  echo "Configuration reset canceled."
  exit 0
fi

# Remove existing .env file if it exists
if [ -f .env ]; then
  echo "Removing existing configuration..."
  rm .env
fi

echo "Creating new .env file..."

# Prompt for PORT with default value
read -p "Enter PORT (default: 3000): " PORT
PORT=${PORT:-3000}
echo "PORT=$PORT" >> .env

# Prompt for API_KEY
read -p "Enter YouTube API Key: " API_KEY
while [ -z "$API_KEY" ]; do
  echo "API Key cannot be empty."
  read -p "Enter YouTube API Key: " API_KEY
done
echo "API_KEY=$API_KEY" >> .env

# Prompt for YOUTUBE_CHANNEL_ID
read -p "Enter YouTube Channel ID: " YOUTUBE_CHANNEL_ID
while [ -z "$YOUTUBE_CHANNEL_ID" ]; do
  echo "YouTube Channel ID cannot be empty."
  read -p "Enter YouTube Channel ID: " YOUTUBE_CHANNEL_ID
done
echo "YOUTUBE_CHANNEL_ID=$YOUTUBE_CHANNEL_ID" >> .env

echo "Configuration has been reset successfully!"

# Ask if user wants to restart the service with new config
read -p "Restart service with new configuration? (y/n): " restart

if [ "$restart" = "y" ] || [ "$restart" = "Y" ]; then
  echo "Restarting services..."
  docker compose down
  docker compose up -d
  echo "Services restarted with new configuration."
else
  echo "Services not restarted. To apply new configuration, run: docker-compose down && docker-compose up -d"
fi