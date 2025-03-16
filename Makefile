.PHONY: help setup update restart status clean logs

help:
    @echo "YouTube Embed Service Commands:"
    @echo "  make setup    - Configure environment variables"
    @echo "  make update   - Update to latest version from GitHub (zero-downtime)"
    @echo "  make restart  - Restart the service"
    @echo "  make status   - Show running containers"
    @echo "  make clean    - Remove unused images"
    @echo "  make logs     - View service logs"

setup:
    @echo "=== YouTube Embed Service Configuration ==="
    @echo -n "Enter PORT (default: 3000): " && read PORT && \
    echo -n "Enter YouTube API Key: " && read API_KEY && \
    echo -n "Enter YouTube Channel ID: " && read CHANNEL_ID && \
    echo "PORT=$${PORT:-3000}" > .env && \
    echo "API_KEY=$$API_KEY" >> .env && \
    echo "YOUTUBE_CHANNEL_ID=$$CHANNEL_ID" >> .env && \
    echo "Configuration saved to .env file."

update:
    @echo "=== Updating YouTube Embed Service ==="
    git pull
    docker compose build app
    docker compose up -d --no-deps app
    docker image prune -f
    @echo "Service updated successfully with zero downtime"

restart:
    @echo "=== Restarting YouTube Embed Service ==="
    docker compose restart app
    @echo "Service restarted"

status:
    docker compose ps

clean:
    docker image prune -f
    @echo "Removed unused images"

logs:
    docker compose logs -f app