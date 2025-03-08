const express = require('express');
const { getLatestVideo } = require('./youtube-api');

function setupRoutes(app) {
    app.get('/api/latest-video', async (req, res) => {
        try {
            const embedUrl = await getLatestVideo();
            res.json({ embedUrl: embedUrl });
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch the latest video' });
        }
    });
}

module.exports = setupRoutes;