# Linky

Linky is a high-performance URL shortening application built for the **Katomaran Hackathon 2026**. It allows users to quickly convert long URLs into custom, trackable short links.

## Video Demonstration
[Insert Video Link Here]

## Features
- **URL Shortening:** Instantly convert long URLs into concise aliases.
- **Custom Aliases:** Personalize your shortened links.
- **Advanced Analytics:** Track total clicks, unique visitors, browser details, devices, referrers, and country-level demographics.
- **Bulk CSV Upload:** Shorten up to 50 URLs at once via a simple CSV upload.
- **Security & Reliability:** JWT-based authentication, rate limiting, and CORS protection.
- **Themes:** Fully responsive application with seamless Light and Dark mode transition.

## Architecture

Linky is built using a modern MERN-stack architecture.

**Frontend:**
- **React.js & Vite:** A fast, interactive single-page application.
- **Tailwind CSS & Global CSS Variables:** Flexible, responsive styling system featuring light/dark mode toggling.
- **Recharts:** Clean, responsive analytics visualization.

**Backend:**
- **Node.js & Express.js:** Efficient RESTful API server.
- **MongoDB & Mongoose:** Scalable NoSQL database for structured storage.
- **UAParser & GeoIP:** Advanced traffic parsing for granular click metrics.

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- MongoDB

### 1. Clone the repository
```bash
git clone <repository_url>
cd URL_SHORTER
```

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` directory with the following variables:
```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:5173
```
Start the backend server:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```
Start the Vite development server:
```bash
npm run dev
```

### 4. Open Application
Navigate to `http://localhost:5173` in your browser.

## Credits
This project was specifically designed and developed for the **Katomaran Hackathon 2026**. All intellectual property aligns with the respective constraints and rules of the hackathon.
