const express = require("express");
const { getLatestVideo, getFeaturedVideo } = require("./youtube-api");

// Helper function to process parent domain
function processParentDomain(parent) {
  if (!parent) return '';
  // Remove port if present and protocol if included
  return parent.replace(/:[\d]+$/, '').replace(/^https?:\/\//, '');
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
      // Get parent site from query parameter (required by Twitch)
      let parentDomain = req.query.parent || 
                         (req.headers.origin ? new URL(req.headers.origin).hostname : 
                         (req.headers.referer ? new URL(req.headers.referer).hostname : 
                         req.headers.host));
      
      parentDomain = processParentDomain(parentDomain);
      
      // Make sure we have a valid parent
      if (!parentDomain) {
        return res.status(400).send("Unable to determine parent domain. Please provide 'parent' parameter with your domain name (without protocol or port).");
      }

      // Validate that channel ID was provided
      if (!channelId) {
        return res.status(400).send("Channel ID is required as a query parameter");
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
        <iframe width="${width}" height="${height}" src="https://player.twitch.tv/?channel=${channelId}&parent=${parentDomain}" frameborder="0" allowfullscreen allow="autoplay; encrypted-media"></iframe>
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
      let parentDomain = req.query.parent || 
                         (req.headers.origin ? new URL(req.headers.origin).hostname : 
                         (req.headers.referer ? new URL(req.headers.referer).hostname : 
                         req.headers.host));
      
      parentDomain = processParentDomain(parentDomain);
      
      // Make sure we have a valid parent
      if (!parentDomain) {
        return res.status(400).send("Unable to determine parent domain. Please provide 'parent' parameter with your domain name (without protocol or port).");
      }

      // Validate that channel ID was provided
      if (!channelId) {
        return res.status(400).send("Channel ID is required as a query parameter");
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
        <iframe width="${width}" height="${height}" src="https://www.twitch.tv/embed/${channelId}/chat?parent=${parentDomain}" frameborder="0"></iframe>
    </div>
</body>
</html>`);
    } catch (error) {
      console.error("Error serving Twitch chat embed:", error);
      res.status(500).send("Failed to create Twitch chat embed");
    }
  });

  // Add a new endpoint specifically for Squarespace
  app.get("/app/twitch-squarespace", async (req, res) => {
    try {
      // Get parameters from query
      const width = req.query.width || "560";
      const height = req.query.height || "315";
      const borderRadius = req.query.borderRadius || "12px";
      const channelId = req.query.channel;
      
      if (!channelId) {
        return res.status(400).send("Channel ID is required as a query parameter");
      }

      // Add CORS headers
      res.header("Access-Control-Allow-Origin", "*");
      res.setHeader("Content-Type", "text/html");
      
      // Send HTML with client-side parent detection
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
        #loading { text-align: center; padding: 20px; }
    </style>
</head>
<body>
    <div id="loading">Loading Twitch stream...</div>
    <div id="twitch-embed" class="video-container" style="display: none;"></div>
    
    <script>
        // Get the domain from the parent page
        function getParentDomain() {
            try {
                // Try to get parent domain from referrer
                if (document.referrer) {
                    return new URL(document.referrer).hostname;
                }
                
                // If that fails, try to access parent location
                if (window.parent && window.parent.location) {
                    return window.parent.location.hostname;
                }
            } catch(e) {
                // Security errors when trying to access parent
                console.error("Error detecting domain:", e);
            }
            
            // Fallbacks with common domains
            return window.location.hostname || "squarespace.com";
        }
        
        // Create the embed once we have the domain
        function createEmbed() {
            const domain = getParentDomain();
            console.log("Detected parent domain:", domain);
            
            const embed = document.getElementById("twitch-embed");
            const loading = document.getElementById("loading");
            
            // Create iframe with correctly detected parent
            embed.innerHTML = \`<iframe width="${width}" height="${height}" 
                src="https://player.twitch.tv/?channel=${channelId}&parent=\${domain}" 
                frameborder="0" allowfullscreen allow="autoplay; encrypted-media"></iframe>\`;
            
            // Show embed, hide loading
            embed.style.display = "block";
            loading.style.display = "none";
        }
        
        // Run when page loads
        window.addEventListener('load', createEmbed);
    </script>
</body>
</html>`);
    } catch (error) {
      console.error("Error serving Twitch stream embed:", error);
      res.status(500).send("Failed to create Twitch stream embed");
    }
  });
}

module.exports = setupRoutes;
