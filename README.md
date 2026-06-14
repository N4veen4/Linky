# Linky – Smart URL Shortener

Linky is a high-performance, responsive URL shortening application built for the **Katomaran Hackathon 2026**. It converts long, complicated URLs into short, trackable links with detailed real-time traffic insights.

---

## 🚀 Live Demo

* **Frontend App:** [https://linky-urls.vercel.app](https://linky-urls.vercel.app)
* **Backend API Server:** [https://backend-one-mu-11.vercel.app](https://backend-one-mu-11.vercel.app)

---

## ✨ Features

- **Instant URL Shortening:** Quick conversion of long links to short aliases.
- **Custom Branded Aliases:** Personalize your shortened links.
- **Real-Time Traffic Analytics:**
  - Click timelines and unique visitor counts.
  - Geo-demographics (countries).
  - Referrers, browser details, and device distributions.
- **Bulk CSV Upload:** Shorten up to 50 URLs at once via a simple CSV interface.
- **Privacy Controls:** Toggle between public and private analytics for individual links.
- **Expiry Control:** Set automatic expiration dates on short links.
- **QR Code Generation:** Auto-generates scannable QR codes for your short URLs.
- **Aesthetic Dark & Light Themes:** Premium design with interactive micro-animations.

---

## 🛠 Tech Stack & Architecture

Linky uses a robust MERN architecture designed to run seamlessly on the cloud:

* **Frontend:** React, Vite, Framer Motion, GSAP, Tailwind CSS, Recharts.
* **Backend:** Node.js, Express.js, Mongoose, UAParser, GeoIP, Express-Rate-Limit.
* **Database:** MongoDB (local for development, MongoDB Atlas for production).
* **Hosting:** Vercel (both Frontend and Backend as Serverless Functions).

---

## 🔧 Environment Variables

### Backend Configuration
Create a `.env` file inside the `backend/` folder:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/url_shortener?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
BASE_URL=https://backend-one-mu-11.vercel.app
NODE_ENV=production
FRONTEND_URL=https://linky-urls.vercel.app
GOOGLE_CLIENT_ID=your_google_client_id
```

### Frontend Configuration
Create a `.env` file inside the `frontend/` folder:
```env
VITE_API_URL=https://backend-one-mu-11.vercel.app/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

---

## 🖥 Local Installation & Development

### Prerequisites
* Node.js (v18+)
* MongoDB running locally

### 1. Backend Setup
```bash
cd backend
npm install
npm run dev
```

### 2. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```
Navigate to `http://localhost:5173`.

---

## ☁️ Production Deployment on Vercel

The application is deployed using the Vercel CLI.

### Deploying the Backend
1. Make sure all backend environment variables are added in your Vercel Dashboard settings.
2. Run in the `backend` folder:
   ```bash
   vercel --prod
   ```

### Deploying the Frontend
1. Configure `VITE_API_URL` pointing to the deployed backend API URL in Vercel settings.
2. Run in the `frontend` folder:
   ```bash
   vercel --prod
   ```
