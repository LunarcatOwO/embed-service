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

  // Get target date from query parameters or use default
  const defaultDate = "April 3, 2025 08:00:00";
  
  // Parse date from query parameters (full date string)
  let targetDateString = req.query.targetDate || defaultDate;
  
  // Or build date from individual components if provided
  if (req.query.year) {
    const year = req.query.year || "2025";
    const month = req.query.month || "4";  // 1-12
    const day = req.query.day || "3";
    const hour = req.query.hour || "8";
    const minute = req.query.minute || "0";
    const second = req.query.second || "0";
    
    // Create date string in format: "April 3, 2025 08:00:00"
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const monthName = months[parseInt(month) - 1];
    targetDateString = `${monthName} ${day}, ${year} ${hour.padStart(2, '0')}:${minute.padStart(2, '0')}:${second.padStart(2, '0')}`;
  }

  // Send HTML for the countdown timer
  res.send(`<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Countdown</title>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=HK+Modular:wght@400;700&display=swap">
    <style>
        body, html { 
            margin: 0; 
            padding: 0; 
            width: 100%; 
            height: 100%; 
            display: flex; 
            justify-content: center; 
            align-items: center; 
            font-family: 'HK Modular', sans-serif; 
            background: transparent; 
        }
        .countdown { 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            background: transparent; 
            border-radius: 12px; 
            padding: 10px; 
            width: 100%; 
            max-width: 600px; 
            height: auto; 
            aspect-ratio: 4 / 1; 
        }
        .countdown div { 
            flex: 1; 
            text-align: center; 
            padding: 8px 4px; 
            margin: 0 5px;
            backdrop-filter: blur(5px);
            background-color: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            display: flex;
            flex-direction: column;
            justify-content: center;
        }
        .countdown .value { 
            font-size: 2.2rem;
            font-weight: 700;
            margin: 0;
            line-height: 1;
            color: #333;
            text-shadow: 0 1px 2px rgba(255, 255, 255, 0.5);
        }
        .countdown .label {
            font-size: 0.8rem;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-top: 4px;
            color: #666;
        }
        .countdown.completed {
            justify-content: center;
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(5px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            animation: pulse 1.5s infinite ease-in-out;
        }
        
        .completion-message {
            text-align: center;
            padding: 20px;
        }
        
        .completion-message span {
            font-size: 2.2rem;
            font-weight: 700;
            color: #333;
            text-shadow: 0 1px 2px rgba(255, 255, 255, 0.5);
        }
        
        @keyframes pulse {
            0% { box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); }
            50% { box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2); }
            100% { box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); }
        }
        @media (max-width: 480px) {
            .countdown .value { font-size: 1.5rem; }
            .countdown .label { font-size: 0.7rem; }
            .countdown div { padding: 6px 2px; margin: 0 3px; }
        }
    </style>
</head>
<body>
    <div class="countdown">
        <div>
            <p id="days" class="value"></p>
            <p class="label">Days</p>
        </div>
        <div>
            <p id="hours" class="value"></p>
            <p class="label">Hours</p>
        </div>
        <div>
            <p id="minutes" class="value"></p>
            <p class="label">Minutes</p>
        </div>
        <div>
            <p id="seconds" class="value"></p>
            <p class="label">Seconds</p>
        </div>
    </div>
    <script>
        // Set the target date and time from the server-provided value
        const targetDate = new Date("${targetDateString}").getTime();

        // Update the countdown every second
        const interval = setInterval(() => {
            const now = new Date().getTime();
            const distance = targetDate - now;

            // Calculate days, hours, minutes, and seconds
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            // Display the result
            document.getElementById("days").textContent = days;
            document.getElementById("hours").textContent = hours;
            document.getElementById("minutes").textContent = minutes;
            document.getElementById("seconds").textContent = seconds;

            // If the countdown is over, display a message
            if (distance < 0) {
                clearInterval(interval);
                
                // Reference the countdown container
                const countdownContainer = document.querySelector('.countdown');
                
                // Clear all existing content
                countdownContainer.innerHTML = '';
                
                // Create a centered completion message
                const completionMessage = document.createElement('div');
                completionMessage.className = 'completion-message';
                completionMessage.innerHTML = '<span>Event Started!</span>';
                
                // Add the message to the container
                countdownContainer.appendChild(completionMessage);
                
                // Add completion styles
                countdownContainer.classList.add('completed');
            }
        }, 1000);
    </script>
</body>
</html>`); 
});

}  // End of setupRoutes function

module.exports = setupRoutes;
