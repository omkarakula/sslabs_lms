import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import CourseDetails from './pages/CourseDetails';
import LearningSession from './pages/LearningSession';
import AddCourse from './pages/AddCourse';
import EditCourse from './pages/EditCourse';
import Students from './pages/Students';
import AddStudent from './pages/AddStudent';
import EditStudent from './pages/EditStudent';
import BulkAddStudents from './pages/BulkAddStudents';
import StudentQuizzes from './pages/StudentQuizzes';
import LandingPage from './pages/LandingPage';
import AuthGateway from './pages/AuthGateway';
import RoleSelection from './pages/RoleSelection';
import Profile from './pages/Profile';
import Certificate from './pages/Certificate';
import InstructorDashboard from './pages/InstructorDashboard';
import ManageEnrollments from './pages/ManageEnrollments';
import InstructorQuizzes from './pages/InstructorQuizzes';
import AdminDashboard from './pages/AdminDashboard';
import Settings from './pages/Settings';
import AdminCourses from './pages/AdminCourses';
import AllStudentsReports from './pages/AllStudentsReports';
import AdminFeedback from './pages/AdminFeedback';
import StudentLogins from './pages/StudentLogins';
import PracticeQuestions from './pages/PracticeQuestions';
import ManagePracticeQuestions from './pages/ManagePracticeQuestions';
import { useLocation, Navigate } from 'react-router-dom';

const RoleBasedDashboard = () => {
  const role = (localStorage.getItem('userRole') || '').toLowerCase();
  if (role === 'admin' || role === 'administrator') return <Navigate to="/admin" replace />;
  if (role === 'instructor') return <Navigate to="/instructor" replace />;
  return <Dashboard />;
};

function AppContent() {
  const location = useLocation();
  
  // Hide navigation on auth-related pages or when not logged in at the starting page
  const hasRole = !!localStorage.getItem('userRole');
  const noNavRoutes = ['/landing', '/auth', '/select-role'];
  const hideNav = noNavRoutes.includes(location.pathname) || (location.pathname === '/' && !hasRole);

  if (hideNav) {
    return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/auth" element={<AuthGateway />} />
        <Route path="/select-role" element={<RoleSelection />} />
      </Routes>
    );
  }

  return (
      <div className="app-container" style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar />
        <div className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Navbar />
          <div className="page-content" style={{ padding: '24px', flex: 1 }}>
            <Routes>
              <Route path="/" element={<RoleBasedDashboard />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/course/:id" element={<CourseDetails />} />
              <Route path="/learn/:id" element={<LearningSession />} />
              <Route path="/admin/add-course" element={<AddCourse />} />
              <Route path="/admin/edit-course/:id" element={<EditCourse />} />
              <Route path="/admin/students" element={<Students />} />
              <Route path="/admin/students/logins" element={<StudentLogins />} />
              <Route path="/admin/add-student" element={<AddStudent />} />
              <Route path="/admin/edit-student/:id" element={<EditStudent />} />
              <Route path="/bulk-add-students" element={<BulkAddStudents />} />
              <Route path="/quizzes" element={<StudentQuizzes />} />
              <Route path="/practice" element={<PracticeQuestions />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/certificate/:courseId" element={<Certificate />} />
              <Route path="/instructor" element={<InstructorDashboard />} />
              <Route path="/instructor/enrollments" element={<ManageEnrollments />} />
              <Route path="/instructor/quizzes" element={<InstructorQuizzes />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/courses" element={<AdminCourses />} />
              <Route path="/admin/enrollments" element={<ManageEnrollments />} />
              <Route path="/admin/feedback" element={<AdminFeedback />} />
              <Route path="/admin/practice" element={<ManagePracticeQuestions />} />
              <Route path="/instructor/practice" element={<ManagePracticeQuestions />} />
              <Route path="/reports" element={<AllStudentsReports />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </div>
        </div>
      </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
