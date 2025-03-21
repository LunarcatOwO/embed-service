const express = require("express");
const { getLatestVideo, getFeaturedVideo } = require("./youtube-api");

function setupRoutes(app) {
  // API endpoint that returns JSON data for latest video
  app.get("/app/json/latest-video", async (req, res) => {
    try {
      const embedUrl = await getLatestVideo();
      res.json({ embedUrl: embedUrl });
    } catch (error) {
      console.error("Error fetching video:", error);
      res.status(500).json({ error: "Failed to fetch the latest video" });
    }
  });

  app.get("/app/json/featured-video", async (req, res) => {
    try {
      const embedUrl = await getFeaturedVideo();
      res.json({ embedUrl: embedUrl });
    } catch (error) {
      console.error("Error fetching featured video:", error);
      res.status(500).json({ error: "Failed to fetch the featured video" });
    }
  });

  // Embed endpoint - returns HTML that can be embedded directly
  app.get("/app/latest-video", async (req, res) => {
    try {
      // Get width and height from query parameters, or use defaults
      const width = req.query.width || "560";
      const height = req.query.height || "315";
      // Get border radius from query parameter or use default
      const borderRadius = req.query.borderRadius || "12px";

      const embedUrl = await getLatestVideo();

      // Add CORS headers to ensure it can be embedded anywhere
      res.header("Access-Control-Allow-Origin", "*");

      // Set content type to HTML
      res.setHeader("Content-Type", "text/html");

      // Send clean HTML with minimal whitespace
      res.send(`<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Latest Video</title>
    <style>
        body, html { margin: 0; padding: 0; height: 100%; overflow: hidden; }
        .video-container { width: 100%; height: 100%; overflow: hidden; border-radius: ${borderRadius}; }
        iframe { width: 100%; height: 100%; border: 0; }
    </style>
</head>
<body>
    <div class="video-container">
        <iframe width="${width}" height="${height}" src="${embedUrl}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
    </div>
</body>
</html>`);
    } catch (error) {
      console.error("Error serving embed:", error);
      res.status(500).send("Failed to fetch the latest video");
    }
  });

  // Embed endpoint for featured video
  app.get("/app/featured-video", async (req, res) => {
    try {
      // Get width and height from query parameters, or use defaults
      const width = req.query.width || "560";
      const height = req.query.height || "315";
      // Get border radius from query parameter or use default
      const borderRadius = req.query.borderRadius || "12px";

      const embedUrl = await getFeaturedVideo();

      // Add CORS headers to ensure it can be embedded anywhere
      res.header("Access-Control-Allow-Origin", "*");

      // Set content type to HTML
      res.setHeader("Content-Type", "text/html");

      // Send clean HTML with minimal whitespace
      res.send(`<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Featured Video</title>
    <style>
        body, html { margin: 0; padding: 0; height: 100%; overflow: hidden; }
        .video-container { width: 100%; height: 100%; overflow: hidden; border-radius: ${borderRadius}; }
        iframe { width: 100%; height: 100%; border: 0; }
    </style>
</head>
<body>
    <div class="video-container">
        <iframe width="${width}" height="${height}" src="${embedUrl}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
    </div>
</body>
</html>`);
    } catch (error) {
      console.error("Error serving embed:", error);
      res.status(500).send("Failed to fetch the featured video");
    }
  });

  // Twitch stream embed endpoint
  app.get("/app/twitch-stream", async (req, res) => {
    try {
      // Get width and height from query parameters, or use defaults
      const width = req.query.width || "560";
      const height = req.query.height || "315";
      // Get border radius from query parameter or use default
      const borderRadius = req.query.borderRadius || "12px";
      // Get channel ID from query parameter
      const channelId = req.query.channel;
      // Get parent site from query parameter (required by Twitch)
      const parentSite = req.query.parent || req.headers.host;

      // Validate that channel ID was provided
      if (!channelId) {
        return res.status(400).send("Channel ID is required as a query parameter");
      }
      if (!parentSite) {
        return res.status(400).send("Parent site is required as a query parameter");
      }

      // Add CORS headers to ensure it can be embedded anywhere
      res.header("Access-Control-Allow-Origin", "*");

      // Set content type to HTML
      res.setHeader("Content-Type", "text/html");

      // Send clean HTML with minimal whitespace
      res.send(`<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Twitch Stream: ${channelId}</title>
    <style>
        body, html { margin: 0; padding: 0; height: 100%; overflow: hidden; }
        .video-container { width: 100%; height: 100%; overflow: hidden; border-radius: ${borderRadius}; }
        iframe { width: 100%; height: 100%; border: 0; }
    </style>
</head>
<body>
    <div class="video-container">
        <iframe width="${width}" height="${height}" src="https://player.twitch.tv/?channel=${channelId}&parent=${parentSite}" frameborder="0" allowfullscreen allow="autoplay; encrypted-media"></iframe>
    </div>
</body>
</html>`);
    } catch (error) {
      console.error("Error serving Twitch stream embed:", error);
      res.status(500).send("Failed to create Twitch stream embed");
    }
  });

  // Twitch chat embed endpoint
  app.get("/app/twitch-chat", async (req, res) => {
    try {
      // Get width and height from query parameters, or use defaults
      const width = req.query.width || "350";
      const height = req.query.height || "500";
      // Get border radius from query parameter or use default
      const borderRadius = req.query.borderRadius || "12px";
      // Get channel ID from query parameter
      const channelId = req.query.channel;
      // Get parent site from query parameter (required by Twitch)
      const parentSite = req.query.parent || req.headers.host;

      // Validate that channel ID was provided
      if (!channelId) {
        return res.status(400).send("Channel ID is required as a query parameter");
      }
      if (!parentSite) {
        return res.status(400).send("Parent site is required as a query parameter");
      }

      // Add CORS headers to ensure it can be embedded anywhere
      res.header("Access-Control-Allow-Origin", "*");

      // Set content type to HTML
      res.setHeader("Content-Type", "text/html");

      // Send clean HTML with minimal whitespace
      res.send(`<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Twitch Chat: ${channelId}</title>
    <style>
        body, html { margin: 0; padding: 0; height: 100%; overflow: hidden; }
        .chat-container { width: 100%; height: 100%; overflow: hidden; border-radius: ${borderRadius}; }
        iframe { width: 100%; height: 100%; border: 0; }
    </style>
</head>
<body>
    <div class="chat-container">
        <iframe width="${width}" height="${height}" src="https://www.twitch.tv/embed/${channelId}/chat?parent=${parentSite}" frameborder="0"></iframe>
    </div>
</body>
</html>`);
    } catch (error) {
      console.error("Error serving Twitch chat embed:", error);
      res.status(500).send("Failed to create Twitch chat embed");
    }
  });
}

module.exports = setupRoutes;
