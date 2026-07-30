# DocFlow AI

DocFlow AI is a lightweight collaborative document workspace with authentication, rich-text editing, file imports, and document sharing.

## What is included

- Secure login and registration with JWT
- Create, edit, and save documents
- Rich text formatting with bold, italic, underline, headings, and lists
- File import and attachment support for text-based files
- Share documents with collaborators by email
- Owned and shared document views in the dashboard
- Persistent storage through a local JSON file store for simple review and demo scenarios

## Tech stack

- Frontend: React + Vite + Axios + Lucide icons + Tiptap
- Backend: Express + JWT + Multer + file-backed persistence

## Quick start

1. Copy the sample environment file
   - `cp .env.example .env`

2. Start the backend
   - `cd server`
   - `npm install`
   - `npm run dev`

3. Start the frontend
   - `cd client`
   - `npm install`
   - `npm run dev`

4. Open the app at `http://localhost:5173`

## Demo accounts

- `demo@docflow.ai` / `demo123`
- `alex@docflow.ai` / `demo123`

## Validation and error handling

- The API exposes a health endpoint at `/api/health`
- Uploads validate supported file types and return clear errors
- Document access is checked before editing or sharing
- The app surfaces user-friendly toast errors for failed saves, uploads, and shares

## Automated test

Run the backend storage test with:

- `cd server`
- `npm test`

## Deployment path

This repository is configured for a simple deployment path with Render and Docker:

- Render: use [render.yaml](render.yaml)
- Docker Compose: run `docker compose up --build`

## Architecture note

The current architecture prioritizes a fast, reviewable implementation over enterprise-grade infrastructure. The frontend is decoupled from the backend through REST API calls, the backend uses a lightweight local persistence layer for easy demos, and document sharing is intentionally simple so reviewers can validate the workflow end-to-end without extra setup.
