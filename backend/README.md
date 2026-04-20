# ⚙️ SkillSwap Backend Engine

The core logic and API infrastructure of SkillSwap, built for high-performance real-time interactions, robust security, and scalable data management.

---

## 🏗️ Architecture & Modules

### 🔐 Authentication & Authorization
- **JWT & Cookie Strategy**: Highly secure authentication using signed, httpOnly, and secure cookies.
- **Google OAuth 2.0**: Integrated with Passport.js for seamless social identity management.
- **Email Verification**: Automatic account verification via Nodemailer and crypto-token generation.
- **Admin Guard**: Specialized middleware for protecting sensitive Governance OS endpoints.

### 💼 Real-Time Engine (Socket.IO)
- **Private Messaging**: Peer-to-peer chat with delivery monitoring.
- **Video Conferencing**: Room-based signaling logic for WebRTC video calls.
- **Dynamic Notifications**: Real-time broadcast system for endorsements, swap requests, and global announcements.

### 🛡️ Security Framework
- **Helmet.js**: Automated HTTP header security (XSS, CSP, HSTS protection).
- **Rate Limiting**: Brute-force protection on Login, Signup, and Admin portals.
- **NoSQL Guard**: `express-mongo-sanitize` prevents database injection attacks.
- **Parameter Pollution (HPP)**: Safeguards against API parameter manipulation.
- **Validation**: Strict input validation using `express-validator`.

### 📂 Asset Management
- **Cloudinary Integration**: Automatic switching between local disk and persistent cloud storage.
- **Multer Filter**: Advanced file filtering (20MB limit, allowed formats validation).

---

## 📂 API Route Structure

| Resource | Base Path | Description |
| :--- | :--- | :--- |
| **Auth** | `/api/auth` | User lifecycle, profiles, and password security. |
| **Skills** | `/api/skills` | Skill creation, ranking, and community endorsements. |
| **Swaps** | `/api/swaps` | Swap lifecycle management (Request -> Accept -> Complete). |
| **Admin** | `/api/admin` | Governance OS, analytics, logs, and system controls. |
| **Messages**| `/api/messages` | Chat history and message management. |
| **Reviews** | `/api/reviews` | Feedback system and platform trust metrics. |

---

## 🛠️ Performance Features
- **Graceful Shutdown**: SIGTERM/SIGINT handlers to close DB connections safely.
- **Health Check**: `/api/health` endpoint for monitoring system vitals.
- **Optimized Queries**: Mongoose-based schema architecture with optimized indexing.

---

## 📦 Core Dependencies
- `express` & `mongoose`
- `socket.io`
- `passport` & `passport-google-oauth20`
- `helmet` & `express-rate-limit`
- `cloudinary` & `multer-storage-cloudinary`
- `bcryptjs` & `jsonwebtoken`

---

## 🔧 Backend Setup

1. **Install Packages**:
   ```bash
   npm install
   ```

2. **Environment Configuration**:
   Ensure all keys are filled in `backend/.env`:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `CLOUDINARY_*`
   - `GOOGLE_*`

3. **Start Development Server**:
   ```bash
   npm run dev:backend
   ```

---

**Robustly Engineered by [Prem Sagar](https://github.com/prem45sagar)**
