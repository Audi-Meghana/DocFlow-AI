# Architecture Overview

## What was prioritized

The implementation focused on a fast, understandable, reviewer-friendly workflow rather than enterprise-grade infrastructure. This means the app favors clear user journeys, simple persistence, and visible product behavior over complex permissions or distributed systems.

## Client

The React frontend uses route-based pages for home, dashboard, and editor experiences. The editor integrates Tiptap for rich text editing and sends requests for persistence, attachments, and sharing. The dashboard distinguishes documents owned by the current user versus documents shared with them.

## Server

The Express backend handles authentication, document CRUD, upload handling, and sharing. For this scope, persistence is file-backed through a JSON store so the product remains easy to run locally and easy to review without needing a managed database.

## Data flow

1. Users sign in or register through the auth API.
2. The dashboard fetches documents visible to the signed-in user.
3. The editor loads, saves, and updates the selected document.
4. Files are uploaded to the server, stored locally, and attached to the document record.
5. Owners can share documents with collaborators by email and the recipient sees the document in their shared view.

## Quality choices

- Local persistence keeps setup simple and makes review and demo flows straightforward.
- Clear API validation and error handling make failures visible and easier to debug.
- A simple automated storage test covers the core persistence and sharing behavior.
