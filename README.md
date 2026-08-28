# ⚙️ Fit-Track Pro Gym (Backend API)

> **Designed and Developed by Gokulkrishna** 🚀

The robust REST API backend powering the Fit-Track Pro Gym application. It handles secure user authentication, database management, and business logic for tracking athlete workouts and performance history.

## 🔗 API Endpoint
**Live API Base URL:** `https://fit-track-backend-02ef.onrender.com`

## ✨ Key Features
- **RESTful API Architecture:** Clean and structured endpoints for Users and Workouts management.
- **Secure Authentication:** JWT (JSON Web Tokens) validation and encrypted password hashing using Bcrypt.js.
- **Protected Routes:** Custom middleware to ensure only authorized athletes can access or modify their personal fitness data.
- **Cloud Hosted:** Fully deployed, managed, and scaled on Render.

## 🛠️ Technology Stack
- **Environment:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB / MySQL (via standard ORM/Drivers)
- **Security:** JWT, Bcrypt.js, CORS
- **Deployment:** Render

## ⚙️ Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone <your-backend-repo-url>
   cd Fit-Track-Backend
Install dependencies:

Bash
npm install
Set up Environment Variables:
Create a .env file in the root directory and configure your keys:

Code snippet
PORT=5000
DB_CONNECTION_STRING=your_database_url
JWT_SECRET=your_super_secret_key
Start the development server:

Bash
npm run dev

🧑‍💻 Author: Gokulkrishna
