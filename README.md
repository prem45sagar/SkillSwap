# 🛡️ SkillSwap: The Elite Skill-Sharing Ecosystem

[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

**SkillSwap** is a cutting-edge, MERN-stack platform designed to transform expertise into currency. It connects experts and learners through a verified, secure, and interactive ecosystem where knowledge is swapped, not just taught.

---

## ✨ Key Features

### 🤝 Seamless Skill Swapping

- **Mutual Discovery**: Find mentors and peers based on specific skill interests.
- **Request Management**: Clean workflow for sending, accepting, and tracking swap requests.
- **Mutual Reviews**: Transparent rating system that ensures quality and trust.

### 👤 Advanced User Profiles

- **3D Interactive Avatars**: Personalized 3D characters powered by Three.js.
- **Verified Platform Integration**: Sync and verify identities from GitHub, LeetCode, Codeforces, and more.
- **Portfolio Showcase**: Display achievements, education, and work experience in a glassmorphic UI.

### 💬 Real-Time Collaboration

- **Integrated Chat**: WhatsApp-like messaging experience with Socket.io.
- **Video Learning**: Built-in video conferencing rooms for real-time teaching.
- **Live Notifications**: Instant updates on messages, endorsements, and swap status.

### 🔐 Governance OS (Admin Dashboard)

- **Identity Control**: Manage users, block offensive content, and audit profiles.
- **Platform Analytics**: Visual growth tracks for users and swap activity.
- **Maintenance Mode**: Remote control over platform availability and system notices.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, Tailwind CSS 4, Vite, Framer Motion, Lucide React, Three.js.
- **Backend**: Node.js, Express.js, MongoDB (Mongoose), Socket.io.
- **Security**: JWT & Cookie-based auth, Passport.js (Google OAuth), Helmet, Rate Limiting.
- **Storage**: Cloudinary (Cloud-based persistent storage for images/docs).
- **Communication**: Nodemailer (Email verification & password reset).

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB Atlas account or local installation
- Cloudinary account (for image uploads)
- Google Cloud Console Project (for OAuth)

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/prem45sagar/SkillSwap.git
   cd SkillSwap
   ```
2. **Setup Backend:**
   Create a `.env` file in the `backend` directory based on `.env.example`:

   ```bash
   cd backend
   # Fill in your MONGODB_URI, JWT_SECRET, CLOUDINARY, and GOOGLE details
   ```
3. **Install Dependencies:**

   ```bash
   npm install
   ```
4. **Initialize Admin (Optional):**

   ```bash
   node scratch/create_initial_admin.js
   ```
5. **Run the Application:**

   ```bash
   npm run dev
   ```

   The app will run at `http://localhost:3000`.

---

## 🔒 Security Best Practices

- **Rate Limiting**: Protection against brute-force attacks on auth routes.
- **NoSQL Injection Prevention**: Automated sanitization of MongoDB queries.
- **Secure Headers**: Implementation of Helmet for XSS and Clickjacking protection.
- **Graceful Shutdown**: Properly closes DB connections on server termination.

---

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

---

**Developed with ❤️ by [Prem Sagar](https://github.com/prem45sagar)**
