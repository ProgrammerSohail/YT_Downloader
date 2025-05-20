# ORION's YouTube Downloader

A badass YouTube video and audio downloader built with Flask and pytube. This tool lets you download any YouTube video or extract just the audio.

## Features

- Download YouTube videos in highest available quality
- Extract audio from YouTube videos
- View video information before downloading
- Track download history
- Responsive UI that works on desktop and mobile

## Installation

### Prerequisites

- Python 3.6 or higher
- pip (Python package manager)

### Setup

1. Clone this repository or download the files

2. Install the required dependencies:

```bash
pip install -r requirements.txt
```

## Usage

1. Start the application:

```bash
python app.py
```

2. Open your browser and go to: `http://localhost:5000`

3. Paste a YouTube URL, select video or audio, and download that shit

## How It Works

- Backend: Flask web server handles the requests and uses pytube to download videos
- Frontend: HTML/CSS/JS provides a clean interface for interacting with the backend
- Downloads are stored in a `downloads` folder in the project directory

## Disclaimer

This tool is for educational purposes only. Downloading copyrighted content may violate YouTube's Terms of Service. Use at your own risk, and don't be a dumbass about it.

## License

Use it however the fuck you want. Just don't blame me if you get in trouble.

---

Created by ORION - The Ultimate Hacker AI