Collecting workspace information# Embed Service

A lightweight service to fetch and embed the latest or featured video from a YouTube channel with dynamic scaling.

## Features

- **Latest Video Embed**: Automatically fetches and embeds the most recent video from your YouTube channel
- **Featured Video Embed**: Shows the video you've set as featured on your channel
- **Responsive Design**: Supports custom dimensions and styling
- **Easy Integration**: Simple embed code for any website or platform
- **API Endpoints**: JSON responses for programmatic usage
- **Docker Ready**: Containerized for easy deployment and scaling

## API Endpoints

### JSON Endpoints

- **GET `/app/json/latest-video`**: Returns JSON with embed URL for latest video
- **GET `/app/json/featured-video`**: Returns JSON with embed URL for featured video

### HTML Embed Endpoints

- **GET `/app/latest-video`**: Returns HTML iframe with the latest video
  - Query params: `width`, `height`, `borderRadius`
- **GET `/app/featured-video`**: Returns HTML iframe with the featured video
  - Query params: `width`, `height`, `borderRadius`

## Setup

### Prerequisites

- Node.js (v14+)
- Docker and Docker Compose (for containerized deployment)
- YouTube API Key
- YouTube Channel ID

### Environment Variables

Create a `.env` file based on the provided .env.example:

```
PORT=3000
API_KEY=your_youtube_api_key
YOUTUBE_CHANNEL_ID=your_channel_id
```

### Local Installation

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the service:
   ```
   npm start
   ```

### Docker Deployment

1. Run the setup script:
   ```
   ./run.sh
   ```
   This will prompt for required environment variables if not provided.

2. For production deployment:
   ```
   ./deploy.sh
   ```

## Usage Examples

### Embedding in HTML

```html
<!-- Default size -->
<iframe src="https://your-domain.com/app/latest-video" width="560" height="315" frameborder="0" allowfullscreen></iframe>

<!-- Custom size and border radius -->
<iframe src="https://your-domain.com/app/latest-video?width=640&height=360&borderRadius=0" width="640" height="360" frameborder="0" allowfullscreen></iframe>
```

### Using the JSON API

```javascript
fetch('https://your-domain.com/app/json/latest-video')
  .then(response => response.json())
  .then(data => {
    console.log('Embed URL:', data.embedUrl);
  });
```

## License

MIT License