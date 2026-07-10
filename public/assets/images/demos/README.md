# Demo Screenshots

This directory contains screenshots from TaktX demo videos that are displayed in the rotating carousel on the landing page.

## Required Files

Place the following screenshots in this directory:

1. **heatmap-demo-1.png** - Screenshot from your first YouTube video (7yAAI3-RaPc)
2. **heatmap-demo-2.png** - Screenshot from your second YouTube video (Q2SWF5UDTTQ)

## How to Create Screenshots from YouTube Videos

### Option 1: From YouTube directly
1. Go to the YouTube video
2. Pause at a good frame showing the heatmap
3. Take a screenshot (Cmd+Shift+4 on Mac, Windows+Shift+S on Windows)
4. Crop to just the video player
5. Save as PNG

### Option 2: Using YouTube's built-in feature
1. Pause the video at the desired frame
2. Right-click on the video player
3. Select "Copy video URL at current time" or take a screenshot

### Option 3: Using ffmpeg (best quality)
```bash
# Extract a frame at 5 seconds into the video
ffmpeg -ss 00:00:05 -i input.mp4 -frames:v 1 heatmap-demo-1.png

# Or download from YouTube and extract
yt-dlp https://youtu.be/7yAAI3-RaPc -o demo1.mp4
ffmpeg -ss 00:00:05 -i demo1.mp4 -frames:v 1 heatmap-demo-1.png
```

## Recommended Image Specifications

- **Format:** PNG or JPG
- **Resolution:** 1280x720 or 1920x1080 (16:9 aspect ratio)
- **File size:** Keep under 500KB for fast loading
- **Optimization:** Use tools like ImageOptim, TinyPNG, or Squoosh to compress

## Current Status

- [ ] heatmap-demo-1.png
- [ ] heatmap-demo-2.png

Once both files are in place, the carousel will automatically display them with smooth transitions every 10 seconds.
