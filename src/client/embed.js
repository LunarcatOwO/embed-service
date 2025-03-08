const embedContainer = document.getElementById('video-embed');

async function fetchLatestVideo() {
    try {
        const response = await fetch('/api/latest-video');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data.embedUrl;
    } catch (error) {
        console.error('Error fetching the latest video:', error);
    }
}

function embedVideo(url, width, height) {
    const iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.width = width;
    iframe.height = height;
    iframe.frameBorder = '0';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowFullscreen = true;
    embedContainer.appendChild(iframe);
}

function scaleEmbed(size) {
    const width = size.width || '560';
    const height = size.height || '315';
    return { width, height };
}

async function init() {
    const embedUrl = await fetchLatestVideo();
    if (embedUrl) {
        const size = scaleEmbed({ width: '100%', height: 'auto' });
        embedVideo(embedUrl, size.width, size.height);
    }
}

document.addEventListener('DOMContentLoaded', init);