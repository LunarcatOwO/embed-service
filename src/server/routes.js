const express = require('express');
const { getLatestVideo } = require('./youtube-api');

function setupRoutes(app) {
    app.get('/app/latest-video', async (req, res) => {
        try {
            // Get width and height from query parameters, or use defaults
            const width = req.query.width || '560';
            const height = req.query.height || '315';
            
            const embedUrl = await getLatestVideo();
            const embedCode = `<iframe 
                width="${width}" 
                height="${height}" 
                src="${embedUrl}" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen>
            </iframe>`;
            
            res.json({
                embedUrl: embedUrl,
                embedCode: embedCode
            });
                
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch the latest video' });
        }
    });
    
    app.get('/app/latest-video/embed', async (req, res) => {
        try {
            const width = req.query.width || '560';
            const height = req.query.height || '315';
            
            const embedUrl = await getLatestVideo();
            
            // Send HTML directly with proper content type
            res.setHeader('Content-Type', 'text/html');
            res.send(`<iframe 
                width="${width}" 
                height="${height}" 
                src="${embedUrl}" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen>
            </iframe>`);
        } catch (error) {
            res.status(500).send('Failed to fetch the latest video');
        }
    });
}

module.exports = setupRoutes;