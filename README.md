# LuxeLMS

LuxeLMS is a modern, premium Learning Management System designed to provide a seamless educational experience for Students, Instructors, and Administrators. Featuring a stunning glassmorphic UI, dynamic role-based navigation, and a robust Node.js backend integrated with Firebase.

## 🌟 Key Features

* **Role-Based Workflows**: Strictly segregated environments and dashboards for Students, Instructors, and Administrators.
* **Premium UI/UX**: Built with a sleek, responsive glassmorphism aesthetic, smooth micro-animations using Framer Motion, and beautiful iconography from Lucide React.
* **Course Management**: Instructors can easily create, manage, and publish courses.
* **Student Tracking**: Administrators and Instructors can monitor student progress, course completions, and grading queues.
* **Analytics Dashboard**: Real-time platform health monitoring, revenue tracking, and live activity feeds.
* **Hybrid Data Persistence**: Fully integrated with Firebase Realtime Database with an automatic local fallback (`db.json`) for seamless offline development.

## 🛠️ Technology Stack

**Frontend:**
* React 18
* Vite
* React Router DOM (Dynamic routing)
* Framer Motion (Animations)
* Lucide React (Icons)
* Vanilla CSS (Glassmorphic Design System)

**Backend:**
* Node.js
* Express.js
* Firebase Admin SDK
* Cors & Dotenv

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. **Clone the repository** (if applicable):
   ```bash
   git clone <repository-url>
   cd LMS
   ```

2. **Install Frontend Dependencies**:
   ```bash
   npm install
   ```

3. **Install Backend Dependencies**:
   ```bash
   cd server
   npm install
   cd ..
   ```

### Firebase Setup (Optional but Recommended)
To enable cloud database persistence:
1. Go to your [Firebase Console](https://console.firebase.google.com/).
2. Navigate to **Project Settings > Service Accounts**.
3. Generate a new private key and download the `.json` file.
4. Rename the file to `serviceAccountKey.json` and place it in the `server/` directory.

*Note: If Firebase credentials are not provided, the backend will automatically fall back to saving data in a local `server/db.json` file to ensure you never lose data during development.*

### Running the Application

This project uses `concurrently` to run both the frontend and backend simultaneously with a single command.

From the root directory (`LMS/`), run:
```bash
npm run dev
```

* **Frontend** will be available at: `http://localhost:5173`
* **Backend API** will be available at: `http://localhost:5000`

## 📂 Folder Structure

```text
LMS/
├── src/
│   ├── components/     # Reusable UI components (Sidebar, Navbar, CourseCard)
│   ├── pages/          # Role-specific views and dashboards
│   ├── App.jsx         # Main routing and role protection logic
│   └── index.css       # Global design system and glassmorphic utilities
├── server/
│   ├── index.js        # Express API and Firebase initialization
│   ├── db.json         # Local fallback database (auto-generated)
│   └── package.json    # Backend dependencies
├── package.json        # Root package with concurrent dev scripts
└── vite.config.js      # Vite bundler configuration
```

## 🗺️ User Journey

1. **Auth/Landing**: Users begin at the landing page and proceed to select their role.
2. **Student**: Browses available courses, tracks learning hours, takes quizzes, and earns certificates.
3. **Instructor**: Creates course content, manages enrollments, and handles grading queues.
4. **Admin**: Monitors global analytics, manages user access, approves/rejects courses, and configures system settings.

## 📝 License
This project is licensed under the MIT License.
