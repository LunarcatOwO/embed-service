Collecting workspace information# YouTube Embed Service

A Node.js service that provides easy embedding of the latest and featured videos from a YouTube channel with dynamic sizing capabilities.

## Features

- Fetch the latest video from a specified YouTube channel
- Fetch the featured video (channel trailer) from a specified YouTube channel
- API endpoints that return video data in JSON format
- Ready-to-use embed endpoints that return HTML with responsive iframes
- Support for customizable embed dimensions

## Installation

1. Clone this repository:
   ```bash
   git clone <repository-url>
   cd youtube-embed-service
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a .env file based on the example:
   ```bash
   cp .env.example .env
   ```

4. Edit the .env file with your YouTube API key and channel ID:
   ```
   API_KEY=your-youtube-api-key
   YOUTUBE_CHANNEL_ID=your-channel-id
   PORT=3000
   ```

## Usage

### Starting the Server

```bash
npm start
```

The server will start on the port specified in your .env file (defaults to 3000).

### API Endpoints

#### JSON Endpoints

- **GET `/app/json/latest-video`**
  Returns the embed URL for the most recent video uploaded to the channel:
  ```json
  { "embedUrl": "https://www.youtube.com/embed/VIDEO_ID" }
  ```

- **GET `/app/json/featured-video`**
  Returns the embed URL for the channel's featured video (or falls back to latest):
  ```json
  { "embedUrl": "https://www.youtube.com/embed/VIDEO_ID" }
  ```

#### Embed Endpoints

- **GET `/app/latest-video`**
  Returns HTML with an embedded iframe for the latest video.
  Query parameters:
  - `width` (optional): Width of the iframe (default: 560)
  - `height` (optional): Height of the iframe (default: 315)

- **GET `/app/featured-video`**
  Returns HTML with an embedded iframe for the featured video.
  Query parameters:
  - `width` (optional): Width of the iframe (default: 560)
  - `height` (optional): Height of the iframe (default: 315)

## Embedding Examples

### Basic embed in HTML

```html
<iframe src="http://your-service-url/app/latest-video" width="560" height="315" frameborder="0" allowfullscreen></iframe>
```

### Embed with custom dimensions

```html
<iframe src="http://your-service-url/app/latest-video?width=640&height=360" width="640" height="360" frameborder="0" allowfullscreen></iframe>
```

### Using the responsive embed endpoint directly

```html
<div style="width: 100%; max-width: 800px;">
  <iframe src="http://your-service-url/app/latest-video" style="width: 100%; height: 450px;" frameborder="0" allowfullscreen></iframe>
</div>
```

## Getting a YouTube API Key

1. Go to the [Google Developers Console](https://console.developers.google.com/)
2. Create a new project
3. Enable the YouTube Data API v3
4. Create credentials for an API key
5. Restrict the API key as needed for security