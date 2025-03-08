const express = require('express');
const { getLatestVideo } = require('./youtube-api');

function setupRoutes(app) {
    app.get('/api/latest-video', async (req, res) => {
        try {
            // Get width and height from query parameters, or use defaults
            const width = req.query.width || '560';
            const height = req.query.height || '315';
            
            const embedUrl = await getLatestVideo();
            
            // Set content type to HTML
            res.setHeader('Content-Type', 'text/html');
            
            // Send HTML document with embedded player
            res.send(`<!DOCTYPE html>
                <html>
                <body style="margin:0;padding:0;">
                    <iframe 
                        width="${width}" 
                        height="${height}" 
                        src="${embedUrl}" 
                        frameborder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowfullscreen>
                    </iframe>
                </body>
                </html>`);
                
        } catch (error) {
            res.status(500).send('Failed to fetch the latest video');
        }
    });
}

module.exports = setupRoutes;