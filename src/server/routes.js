const express = require('express');
const { getLatestVideo, getFeaturedVideo } = require('./youtube-api');

function setupRoutes(app) {
    // API endpoint that returns JSON data for latest video
    app.get('/app/json/latest-video', async (req, res) => {
        try {
            const embedUrl = await getLatestVideo();
            res.json({ embedUrl: embedUrl });
        } catch (error) {
            console.error('Error fetching video:', error);
            res.status(500).json({ error: 'Failed to fetch the latest video' });
        }
    });
    
    // API endpoint for featured video (what appears on channel homepage)
    app.get('/app/json/featured-video', async (req, res) => {
        try {
            const embedUrl = await getFeaturedVideo();
            res.json({ embedUrl: embedUrl });
        } catch (error) {
            console.error('Error fetching featured video:', error);
            res.status(500).json({ error: 'Failed to fetch the featured video' });
        }
    });
    
    // Embed endpoint - returns HTML that can be embedded directly
    app.get('/app/latest-video', async (req, res) => {
        try {
            // Get width and height from query parameters, or use defaults
            const width = req.query.width || '560';
            const height = req.query.height || '315';
            
            const embedUrl = await getLatestVideo();
            
            // Add CORS headers to ensure it can be embedded anywhere
            res.header('Access-Control-Allow-Origin', '*');
            
            // Set content type to HTML
            res.setHeader('Content-Type', 'text/html');
            
            // Send clean HTML with minimal whitespace
            res.send(`<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Latest Video</title>
    <style>
        body, html { margin: 0; padding: 0; height: 100%; overflow: hidden; }
        iframe { width: 100%; height: 100%; border: 0; }
    </style>
</head>
<body>
    <iframe width="${width}" height="${height}" src="${embedUrl}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</body>
</html>`);
        } catch (error) {
            console.error('Error serving embed:', error);
            res.status(500).send('Failed to fetch the latest video');
        }
    });
    
    // Embed endpoint for featured video
    app.get('/app/featured-video', async (req, res) => {
        try {
            // Get width and height from query parameters, or use defaults
            const width = req.query.width || '560';
            const height = req.query.height || '315';
            
            const embedUrl = await getFeaturedVideo();
            
            // Add CORS headers to ensure it can be embedded anywhere
            res.header('Access-Control-Allow-Origin', '*');
            
            // Set content type to HTML
            res.setHeader('Content-Type', 'text/html');
            
            // Send clean HTML with minimal whitespace
            res.send(`<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Featured Video</title>
    <style>
        body, html { margin: 0; padding: 0; height: 100%; overflow: hidden; }
        iframe { width: 100%; height: 100%; border: 0; }
    </style>
</head>
<body>
    <iframe width="${width}" height="${height}" src="${embedUrl}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</body>
</html>`);
        } catch (error) {
            console.error('Error serving embed:', error);
            res.status(500).send('Failed to fetch the featured video');
        }
    });
}

module.exports = setupRoutes;