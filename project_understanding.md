# Project Understanding: YTVideoMAx

Based on the `architecture.md` file, here's a summary of the project:

## Overview
YTVideoMAx is a project designed to download videos, split into a frontend and a backend.

## Architecture
- **Frontend:** Built with Next.js (React, JS/TS, CSS Modules/TailwindCSS), intended to be fully decoupled and hosted on platforms like Vercel or Netlify.
- **Backend:** A Flask REST API using Python, with dependencies like `pytubefix` and `ffmpeg`. It's planned to be hosted on AWS.
- **Communication:** The frontend and backend communicate exclusively via a RESTful API (HTTP/JSON).

## Folder Structure
The proposed structure is:
```
Jailbrealk/
│
├── backend/ (Flask app, scripts, downloads)
├── frontend/ (Next.js app)
├── README.md
└── architecture.md
```

## Key Recommendations
- Frontend should handle all UI logic and use fetch/axios for API calls.
- Backend should be refactored to only serve API endpoints and enable CORS.
- Separate development workflows for frontend and backend.
- Use cloud platforms (Vercel/Netlify, AWS) for hosting and CI/CD. 