# 🛠️ Artisan Directory API

This is the backend API for the ArtisanHub platform — a directory of verified artisans, with authentication, reviews, job booking, and more.

## 📦 Tech Stack

- Node.js + Express
- MongoDB + Mongoose
- ImageKit for file uploads
- Redis for token management
- Swagger for API Docs
- JWT authentication + cookies

## 🚀 Features

- 🔐 Auth (Signup/Login/Email verification/Forgot password)
- 👤 User & Artisan Profiles
- ✅ Email Verification & Admin Approval
- 💼 Job Bookings
- 🌍 Search by Location, Skill, Rating
- 📷 Avatar Uploads via ImageKit
- 📊 Swagger API Docs
- 🛑 Rate Limiting & Role-based Middleware

---

## 🧰 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/your-username/artisan-hub-api.git
cd artisan-hub-api

### 2. Install dependencies
npm install

### 3. Environment Setup
Create a .env file:

PORT=5000
MONGODB_URI=mongodb://localhost:27017/artisanhub
ACCESS_TOKEN_SECRET=yourAccessTokenSecret
REFRESH_TOKEN_SECRET=yourRefreshTokenSecret
REDIS_URL=redis://localhost:6379
IMAGEKIT_PUBLIC_KEY=yourPublicKey
IMAGEKIT_PRIVATE_KEY=yourPrivateKey
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id
EMAIL_USER=you@example.com
EMAIL_PASS=your_password

### 4. Run Locally
npm run dev

📚 API Documentation
Visit http://localhost:5000/api-docs

🔐 Authentication
JWT-based
Secure cookie storage
Access token expiration + refresh strategy
Token blacklist on logout

# 📘 Swagger Documentation

Your API is fully documented with Swagger.

## 🔗 Access it

- Local: [http://localhost:5000/api-docs](http://localhost:5000/api-docs)
- Production: [https://your-production-url.com/api-docs](https://your-production-url.com/api-docs)

---

## 📂 Available Tags

- **Auth** — Signup, Login, Reset Password, Verification
- **Users** — View/update user profile, Admin user management
- **Artisans** — Public directory, Profile update, Toggle availability
- **Jobs** — Book, cancel, complete jobs
- **Reviews** — Leave reviews, Get reviews
- **Admin** — Approve artisans, Get analytics
- **Categories** — Artisan skill types
- **Locations** — Distinct city-based filtering
- **Uploads** — Avatar uploads with ImageKit

---

## 🛡️ Authentication

- **Type**: Cookie-based
- **AccessToken Cookie**: Sent via browser (httpOnly)
- All protected routes require login.

## 🏗 Folder Structure
.
├── controllers/
├── middleware/
├── models/
├── routes/
├── utils/
└── swagger.js
