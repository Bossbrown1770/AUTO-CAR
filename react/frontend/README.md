# AutoCentral React Frontend

This is a single React app for both admin and user flows, fully integrated with the Node.js/Express/MongoDB backend.

## Features
- User: Browse/search cars, view car details (multiple images), request info, payment intent
- Admin: Add/edit/delete cars, manage images, users, About/Contact content

## Structure
- `/src/components` — Shared React components
- `/src/pages` — Page components (Home, CarDetail, Payment, AdminDashboard, etc.)
- `/src/api` — API helpers for backend communication
- `/src/App.js` — Main app with React Router

## Setup
1. `cd frontend`
2. `npm install`
3. `npm start`

## Backend
- Make sure the backend is running at the API URL set in `.env` (default: `http://localhost:5000`)

## Deployment
- Build with `npm run build` for production
