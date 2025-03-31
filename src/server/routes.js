const express = require("express");
const { getLatestVideo, getFeaturedVideo } = require("./youtube-api");

// Helper function to process parent domain
function processParentDomain(parent) {
  if (!parent) return "";
  // Remove port if present and protocol if included
  return parent.replace(/:[\d]+$/, "").replace(/^https?:\/\//, "");
}

// Get the default parent domain configuration
const DEFAULT_PARENT_DOMAIN = process.env.DEFAULT_PARENT_DOMAIN || "";

// Helper function to get multiple parent domains for Twitch embedding
function getParentDomains(req) {
  // Get domains from various sources
  const providedDomains = req.query.parent ? req.query.parent.split(",") : [];
  const originDomain = req.headers.origin
    ? new URL(req.headers.origin).hostname
    : "";
  const refererDomain = req.headers.referer
    ? new URL(req.headers.referer).hostname
    : "";
  const hostDomain = req.headers.host ? req.headers.host.split(":")[0] : "";

  // Collect all detected domains
  const domains = [...providedDomains];
  if (originDomain) domains.push(originDomain);
  if (refererDomain && !domains.includes(refererDomain))
    domains.push(refererDomain);
  if (hostDomain && !domains.includes(hostDomain)) domains.push(hostDomain);

  // Add the default domain if provided in environment
  if (DEFAULT_PARENT_DOMAIN && !domains.includes(DEFAULT_PARENT_DOMAIN)) {
    domains.push(DEFAULT_PARENT_DOMAIN);
  }

  // Process each domain to ensure proper format
  return domains.map((domain) => processParentDomain(domain)).filter((d) => d);
}

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

      // Get all possible parent domains
      const parentDomains = getParentDomains(req);

      // Make sure we have at least one valid parent domain
      if (parentDomains.length === 0) {
        return res
          .status(400)
          .send(
            "Unable to determine parent domain. Please provide 'parent' parameter with your domain name (without protocol or port)."
          );
      }

      // Validate that channel ID was provided
      if (!channelId) {
        return res
          .status(400)
          .send("Channel ID is required as a query parameter");
      }

      // Add CORS headers to ensure it can be embedded anywhere
      res.header("Access-Control-Allow-Origin", "*");

      // Set content type to HTML
      res.setHeader("Content-Type", "text/html");

      // Create the parent parameter string for the Twitch embed
      const parentParam = parentDomains.join("&parent=");

      // Send clean HTML with minimal whitespace for Twitch stream
      res.send(`<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Twitch Stream: ${channelId}</title>
    <style>
        body, html { margin: 0; padding: 0; height: 100%; overflow: hidden; background: transparent; }
        .video-container { width: 100%; height: 100%; overflow: hidden; border-radius: ${borderRadius}; background: transparent; border: none; line-height: 0; }
        iframe { width: 100%; height: 100%; border: 0; display: block; margin: 0; padding: 0; background: transparent; }
    </style>
</head>
<body>
    <div class="video-container">
        <iframe width="${width}" height="${height}" src="https://player.twitch.tv/?channel=${channelId}&parent=${parentParam}" <iframe width="${width}" height="${height}" src="https://player.twitch.tv/?channel=${channelId}&parent=${parentParam}" frameborder="0" allowfullscreen allow="autoplay; encrypted-media"></iframe>
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

      // Get all possible parent domains
      const parentDomains = getParentDomains(req);

      // Make sure we have at least one valid parent domain
      if (parentDomains.length === 0) {
        return res
          .status(400)
          .send(
            "Unable to determine parent domain. Please provide 'parent' parameter with your domain name (without protocol or port)."
          );
      }

      // Validate that channel ID was provided
      if (!channelId) {
        return res
          .status(400)
          .send("Channel ID is required as a query parameter");
      }

      // Add CORS headers to ensure it can be embedded anywhere
      res.header("Access-Control-Allow-Origin", "*");

      // Set content type to HTML
      res.setHeader("Content-Type", "text/html");

      // Create the parent parameter string for the Twitch embed
      const parentParam = parentDomains.join("&parent=");

      // Send clean HTML with minimal whitespace for Twitch chat
      res.send(`<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Twitch Chat: ${channelId}</title>
    <style>
        body, html { margin: 0; padding: 0; height: 100%; overflow: hidden; background: transparent; }
        .chat-container { width: 100%; height: 100%; overflow: hidden; border-radius: ${borderRadius}; background: transparent; border: none; line-height: 0; }
        iframe { width: 100%; height: 100%; border: 0; display: block; margin: 0; padding: 0; background: transparent; }
    </style>
</head>
<body>
    <div class="chat-container">
        <iframe width="${width}" height="${height}" src="https://www.twitch.tv/embed/${channelId}/chat?parent=${parentParam}" frameborder="0"></iframe>
    </div>
</body>
</html>`);
    } catch (error) {
      console.error("Error serving Twitch chat embed:", error);
      res.status(500).send("Failed to create Twitch chat embed");
    }
  });

  // Countdown timer embed endpoint
  app.get("/app/countdown", (req, res) => {
    // Add CORS headers to ensure it can be embedded anywhere
    res.header("Access-Control-Allow-Origin", "*");

    // Set content type to HTML
    res.setHeader("Content-Type", "text/html");

    // Send HTML for the countdown timer
    res.send(`<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Countdown</title>
    <style>
        body, html { 
            margin: 0; 
            padding: 0; 
            height: 100%; 
            display: flex; 
            justify-content: center; 
            align-items: center; 
            font-family: Arial, sans-serif; 
            background: transparent; 
        }
        .countdown { 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            background: #ffffff; /* Solid white background */
            border: 2px solid #000; /* Black border */
            border-radius: 12px; /* Rounded corners */
            padding: 10px; 
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* Subtle shadow */
            width: 100%; /* Responsive width */
            max-width: 100%; /* Allow it to grow with the frame */
            height: auto; /* Adjust height dynamically */
        }
        .countdown div { 
            flex: 1; 
            text-align: center; 
            padding: 10px; 
            border-right: 1px solid #000; /* Divider line */
        }
        .countdown div:last-child { 
            border-right: none; /* Remove the last divider */
        }
        .countdown p { 
            font-size: 1.5rem; /* Adjusted font size */
            margin: 0; 
        }
    </style>
</head>
<body>
    <div class="countdown">
        <div><p id="days"></p></div>
        <div><p id="hours"></p></div>
        <div><p id="minutes"></p></div>
        <div><p id="seconds"></p></div>
    </div>
    <script>
        // Set the target date and time
        const targetDate = new Date("April 3, 2025 08:00:00").getTime();

        // Update the countdown every second
        const interval = setInterval(() => {
            const now = new Date().getTime();
            const distance = targetDate - now;

            // Calculate days, hours, minutes, and seconds
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            // Display the result
            document.getElementById("days").textContent = days + "d";
            document.getElementById("hours").textContent = hours + "h";
            document.getElementById("minutes").textContent = minutes + "m";
            document.getElementById("seconds").textContent = seconds + "s";

            // If the countdown is over, display a message
            if (distance < 0) {
                clearInterval(interval);
                document.getElementById("days").textContent = "";
                document.getElementById("hours").textContent = "";
                document.getElementById("minutes").textContent = "";
                document.getElementById("seconds").textContent = "Started!";
            }
        }, 1000);
    </script>
</body>
</html>`);
  });
}

module.exports = setupRoutes;
