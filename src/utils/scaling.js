export function scaleEmbed(originalWidth, originalHeight, requestedWidth) {
    const aspectRatio = originalWidth / originalHeight;
    const scaledHeight = requestedWidth / aspectRatio;
    return {
        width: requestedWidth,
        height: scaledHeight
    };
}