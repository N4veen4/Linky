# 𝓛𝓲𝓷𝓴𝔂 — Premium Link Management & Intelligent Analytics

Linky is a high-performance MERN-stack URL shortening platform built for the **Katomaran Hackathon 2026**. It allows creators, teams, and developers to transform messy URLs into clean, customizable links while gathering real-time, high-fidelity traffic analytics.

---

## 🚀 Active Deployments
- **Web Interface (Vercel):** [https://linky-urls.vercel.app](https://linky-urls.vercel.app)
- **API Server & Redirector (Vercel):** [https://backend-one-mu-11.vercel.app](https://backend-one-mu-11.vercel.app)

---

## 🎥 Demonstration Video
> [!IMPORTANT]
> The explanatory video demonstrating the application setup, bulk uploading, and analytics flows can be accessed below.
- **Walkthrough Video Link:** [Insert Video Link Here]

---

## 📂 System Core Architecture

```mermaid
graph TD
    Client[React SPA - linky-urls.vercel.app] <-->|REST API + JWT Auth| Server[Express Server - backend-one-mu-11.vercel.app]
    Server <-->|Mongoose ODM| Atlas[(MongoDB Atlas Cloud)]
    Redirector[Redirect Request: GET /:shortCode] --> Server
    Server -->|Parse Metadata & Geolocation| Destination[Target Long URL Destination]
```

---

## 📸 Screenshots Section

### 🖥️ Marketing Landing Page
![Landing Page](frontpage%20refference/Screenshot%202026-06-13%20173044.png)

### 📊 Link Manager & Dashboard
![Dashboard Page](frontpage%20refference/Screenshot%202026-06-13%20173107.png)

### 📈 Intelligent Traffic Analytics
![Analytics Page](frontpage%20refference/Screenshot%202026-06-13%20173141.png)

---

## 📋 Comprehensive Capabilities

### 🔐 Secure Identity Access
* **Credentials Flow:** Form-based signup and login with client-side verification and security styling.
* **OAuth 2.0 Integration:** Direct sign-in using Google Authentication.
* **Access Control:** Custom middleware validation for JWT verification on protected resources.

### 🔗 Dynamic Link Shortener
* **Instant Mapping:** High-speed translation of URLs to unique random codes.
* **Custom Slug Aliasing:** Configure memorable brand slugs (e.g. `linky-urls.vercel.app/my-alias`).
* **Expiration Control:** Optional campaign timers returning `410 Gone` after link expiration.
* **Action Center:** Delete links instantly or copy them to the clipboard.

### 📊 Real-Time Click Intelligence
* **Browser Breakdown:** Visual radial metrics mapping browser platforms (Chrome, Safari, Firefox, Edge).
* **Device Profiling:** Desktop, Tablet, and Mobile categorization.
* **Geolocation Mapping:** IP-based tracking assigning click origins to global countries.
* **Referrer Analytics:** Identifying acquisition sources (Direct, Social, Search Engine, Custom).
* **Click Timelines:** Interactive Recharts graphs plotting click velocity over time.

### 📦 Bulk URL Generation
* **CSV Processing Engine:** Batch-upload up to 50 URLs simultaneously.
* **Output Compilation:** Download generated tables linking original and short codes.

### 📱 Responsive Vector QR Codes
* **Interactive Modals:** Vector QR rendering on demand.
* **Downloads:** Instant vector PNG export for physical or print marketing assets.

---

## 🛠 Project Blueprint (Folder Structure)

```
URL_SHORTER/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                 # MongoDB connection logic
│   │   ├── controllers/
│   │   │   ├── authController.js     # Signup, login, & profiles
│   │   │   ├── bulkController.js     # Bulk CSV processing engine
│   │   │   ├── redirectController.js # Minimal-latency 302 redirect logic
│   │   │   └── urlController.js      # CRUD operations for URL creation
│   │   ├── middleware/
│   │   │   ├── auth.js               # JWT security interceptor
│   │   │   └── errorHandler.js       # Centralized JSON error catcher
│   │   ├── models/
│   │   │   ├── User.js               # User accounts schema
│   │   │   ├── Url.js                # URL schemas with custom aliases
│   │   │   └── Analytics.js          # Geolocation & Agent tracking schema
│   │   ├── routes/
│   │   │   ├── authRoutes.js         # Authentication endpoints
│   │   │   ├── urlRoutes.js          # Operations endpoints
│   │   │   └── analyticsRoutes.js    # Traffic stats endpoints
│   │   ├── utils/
│   │   │   ├── generateShortCode.js  # Clean nanoid shortcode builder
│   │   │   ├── generateToken.js      # Secure JWT sign helper
│   │   │   └── geoLookup.js          # Geolocation lookup module
│   │   └── app.js                    # Server startup script
│   ├── vercel.json                   # Serverless deployment configuration
│   └── package.json                  # Backend dependencies manifest
├── frontend/
│   ├── src/
│   │   ├── assets/                   # Images and branding files
│   │   ├── components/
│   │   │   ├── AnalyticsView.jsx     # Traffic graph dashboards
│   │   │   ├── Auth.jsx              # Sign-In/Sign-Up modal card
│   │   │   ├── BulkUpload.jsx        # File uploader drag-and-drop
│   │   │   ├── Dashboard.jsx         # Links lists and management
│   │   │   ├── QRCodeModal.jsx       # QR generation and download
│   │   │   ├── SettingsSidebar.jsx   # Profile settings slider
│   │   │   └── SplashScreen.jsx      # Morphing GSAP load animation
│   │   ├── utils/
│   │   │   └── api.js                # Global Axios / fetch client layer
│   │   ├── App.css                   # Custom global visual tokens
│   │   ├── index.css                 # Base typography presets
│   │   ├── App.jsx                   # Central state & component router
│   │   └── main.jsx                  # Virtual DOM mounter
│   ├── index.html                    # Single Page Application document
│   ├── vite.config.js                # Bundle builder settings
│   ├── vercel.json                   # Production SPA router rules
│   └── package.json                  # Frontend dependencies manifest
└── README.md
```

---

## 🔌 API Documentation

### 🔐 Authentication API

| Method | Endpoint | Description | Token Required |
| :--- | :--- | :--- | :---: |
| **POST** | `/api/auth/signup` | Registers a new account | No |
| **POST** | `/api/auth/login` | Authenticates existing credentials | No |
| **POST** | `/api/auth/google` | Verifies Google OAuth Token | No |
| **GET** | `/api/auth/me` | Fetches active user profile | Yes (JWT) |

### 🔗 Shortener API

| Method | Endpoint | Description | Token Required |
| :--- | :--- | :--- | :---: |
| **POST** | `/api/url/shorten` | Shortens a single target destination | Yes (JWT) |
| **GET** | `/api/url` | Retrieves all URLs created by user | Yes (JWT) |
| **DELETE** | `/api/url/:id` | Removes link and associated analytics | Yes (JWT) |
| **PUT** | `/api/url/:id/public-toggle` | Toggles dashboard public/private | Yes (JWT) |
| **POST** | `/api/url/bulk` | Batch shorten via CSV upload | Yes (JWT) |
| **GET** | `/:shortCode` | Redirection route mapped to target | No |

### 📊 Analytics API

| Method | Endpoint | Description | Token Required |
| :--- | :--- | :--- | :---: |
| **GET** | `/api/analytics/:shortCode` | Admin view of comprehensive analytics | Yes (JWT) |
| **GET** | `/api/analytics/public/:shortCode` | Publicly shared link analytics page | No |

---

## ⚙️ Environment Configurations

### Backend Setup (`backend/.env`)
```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/url_shortener?retryWrites=true&w=majority
JWT_SECRET=your_jwt_signing_secret_key_development_only_123
JWT_EXPIRES_IN=7d
BASE_URL=https://backend-one-mu-11.vercel.app
NODE_ENV=production
FRONTEND_URL=https://linky-urls.vercel.app
GOOGLE_CLIENT_ID=your_google_client_id_here
```

### Frontend Setup (`frontend/.env`)
```env
VITE_API_URL=https://backend-one-mu-11.vercel.app/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
```

---

## 💻 Local Setup Instructions

### ⚙️ Backend Setup
1. **Navigate:** `cd backend`
2. **Install modules:** `npm install`
3. **Configure env:** Copy `.env.example` to `.env` and fill in credentials.
4. **Run:** `npm run dev` (Runs locally on `http://localhost:5000`)

### 🎨 Frontend Setup
1. **Navigate:** `cd ../frontend`
2. **Install modules:** `npm install`
3. **Configure env:** Create `.env` file and set `VITE_API_URL=http://localhost:5000/api`.
4. **Run:** `npm run dev` (Vite dev server starts on `http://localhost:5173`)

### 🗄️ Database Setup (MongoDB Atlas)
1. Register on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create an M0 (Free) cluster.
3. Add a Database User (keep credentials for `.env`).
4. Set **Network Access** to `0.0.0.0/0` (Allows Vercel servers to connect).
5. Copy the driver connection string and paste as `MONGODB_URI` in `backend/.env`.

---

## 💡 Assumptions Made
- **Header Parsing:** GeoIP & User-Agent metrics are resolved on-the-fly during short link clicks by analyzing request headers before redirection.
- **Vercel Serverless Outbound IPs:** Since Vercel Serverless functions use dynamic outbound IPs, the cloud database cluster must allow access from `0.0.0.0/0`.
- **LocalStorage JWT:** Token sessions are securely verified using standard authorization headers.

---

## 🔭 Future Enhancements
- **WebSocket Feeds:** Real-time dashboard traffic logs update instantly.
- **Custom domains routing:** Custom branding for redirected links.
- **Notification center:** Instant warning alerts when campaigns expire.

---

## 📦 Sample Database Entities

### 👤 User Document
```json
{
  "_id": "603d7b88939c3e449830501a",
  "username": "Naveen Balaji",
  "email": "naveen@example.com",
  "password": "$2a$10$Uv0pXw3yVn9C7qKzDq1eOuO8/G/rBw4E6m7v6L5x1e3Q8.J7V1/Ke",
  "createdAt": "2026-06-13T10:00:00.000Z"
}
```

### 🔗 URL Document
```json
{
  "_id": "603d7bc0939c3e449830501b",
  "originalUrl": "https://www.google-antigravity.com/deepmind/research/paper/extremely-long-url-format",
  "shortCode": "aB3dE",
  "customAlias": "deepmind-paper",
  "creator": "603d7b88939c3e449830501a",
  "isPublicStats": true,
  "createdAt": "2026-06-13T10:10:00.000Z"
}
```

### 📊 Analytics Visit Document
```json
{
  "_id": "603d7c5a939c3e449830501c",
  "urlId": "603d7bc0939c3e449830501b",
  "shortCode": "aB3dE",
  "timestamp": "2026-06-13T12:34:56.000Z",
  "ip": "192.168.1.101",
  "browser": "Chrome",
  "device": "Desktop",
  "country": "India"
}
```

---

## 🪵 Sample Logs

### 📥 Request Log
```http
POST /api/url/shorten HTTP/1.1
Host: backend-one-mu-11.vercel.app
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "originalUrl": "https://react.dev/reference/react",
  "customAlias": "react-ref"
}
```

### 📤 Response Log
```http
HTTP/1.1 201 Created
Content-Type: application/json
Access-Control-Allow-Origin: *

{
  "success": true,
  "data": {
    "_id": "603d7bc0939c3e449830501b",
    "originalUrl": "https://react.dev/reference/react",
    "shortCode": "xY9zR",
    "customAlias": "react-ref",
    "isPublicStats": false,
    "createdAt": "2026-08-30T00:00:00.000Z"
  }
}
```

---

## 👨‍💻 Author
- **Name:** Naveen Balaji
- **Role:** Full Stack Developer & AI enthusiast
- **Project Scope:** Katomaran Hackathon 2026

This project is a part of a hackathon run by https://katomaran.com
