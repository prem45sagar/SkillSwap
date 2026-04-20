# SkillSwap Backend

This is the backend for the SkillSwap application, built with Node.js, Express, and MongoDB.

## Features

-   **User Authentication**: Signup, Login, JWT-based protection.
-   **Email Verification**: New users must verify their email before logging in.
-   **Password Reset**: Users can request a password reset link via email.
-   **Skill Management**: Users can create, view, and delete skills.
-   **Swap Requests**: Users can request to swap skills with others.

## Setup

1.  **Environment Variables**:
    -   Copy `.env.example` to `.env`.
    -   Fill in your `MONGODB_URI`, `JWT_SECRET`, and email configuration (e.g., Mailtrap).

2.  **Install Dependencies**:
    -   Run `npm install` at the root.

3.  **Run the Server**:
    -   Run `npm run dev:backend` to start the backend server.
    -   Run `npm run dev` to start both frontend and backend concurrently.

## API Endpoints

-   `POST /api/auth/signup`: Register a new user.
-   `POST /api/auth/login`: Log in a user.
-   `GET /api/auth/verify-email?token=...`: Verify email address.
-   `POST /api/auth/request-password-reset`: Request a password reset link.
-   `POST /api/auth/reset-password`: Reset password with token.
-   `GET /api/skills`: Get all skills.
-   `POST /api/skills`: Create a new skill (Protected).
-   `GET /api/swaps`: Get user's swap requests (Protected).
-   `POST /api/swaps`: Create a new swap request (Protected).
