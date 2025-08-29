# AutoCentral Full-Stack App

This project contains both the backend (Node.js/Express/MongoDB) and frontend (React) for AutoCentral.

## Backend Setup

1. Go to the backend folder:
   ```bash
   cd react/backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with your MongoDB URI:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   ```
4. Start the backend server:
   ```bash
   npm run dev
   # or for production
   npm start
   ```

## Frontend Setup

1. Open a new terminal and go to the frontend folder:
   ```bash
   cd react/frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with the backend API URL (if not using localhost):
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   ```
4. Start the React app:
   ```bash
   npm start
   ```

## Production Hosting
- Deploy the backend (e.g. on Render) and set the correct API URL in the frontend `.env`.
- Build the frontend with `npm run build` and deploy to your preferred static hosting.

## Features
- User: Browse/search cars, view details (multiple images), request info, payment intent
- Admin: Add/edit/delete cars (with images), manage users, edit About/Contact content

---

For any further customization, just ask!
