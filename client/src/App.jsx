import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';

// Landing
import LandingPage from './pages/LandingPage';

// Auth
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Student
import StudentDashboard from './pages/student/StudentDashboard';
import BrowseCourses from './pages/student/BrowseCourses';
import MyCourses from './pages/student/MyCourses';
import CourseLearning from './pages/student/CourseLearning';
import StudentChat from './pages/student/StudentChat';
import StudentCertificates from './pages/student/StudentCertificates';
import StudentBadges from './pages/student/StudentBadges';

// Mentor
import MentorDashboard from './pages/mentor/MentorDashboard';
import MentorCourses from './pages/mentor/MentorCourses';
import MentorStudents from './pages/mentor/MentorStudents';
import MentorCertificates from './pages/mentor/MentorCertificates';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminCourses from './pages/admin/AdminCourses';
import AdminReports from './pages/admin/AdminReports';
import AdminBadges from './pages/admin/AdminBadges';

// Employer
import EmployerDashboard from './pages/employer/EmployerDashboard';
import StudentDirectory from './pages/employer/StudentDirectory';

// Shared
import VideoMeeting from './pages/VideoMeeting';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#1e293b', color: '#f1f5f9', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', fontSize: '14px' },
            success: { iconTheme: { primary: '#059669', secondary: '#fff' } },
            error: { iconTheme: { primary: '#dc2626', secondary: '#fff' } },
          }}
        />

        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Student */}
          <Route path="/student/dashboard" element={<ProtectedRoute roles={['student']}><StudentDashboard /></ProtectedRoute>} />
          <Route path="/student/browse" element={<ProtectedRoute roles={['student']}><BrowseCourses /></ProtectedRoute>} />
          <Route path="/student/courses" element={<ProtectedRoute roles={['student']}><MyCourses /></ProtectedRoute>} />
          <Route path="/student/course/:courseId" element={<ProtectedRoute roles={['student']}><CourseLearning /></ProtectedRoute>} />
          <Route path="/student/chat" element={<ProtectedRoute roles={['student']}><StudentChat /></ProtectedRoute>} />
          <Route path="/student/certificates" element={<ProtectedRoute roles={['student']}><StudentCertificates /></ProtectedRoute>} />
          <Route path="/student/badges" element={<ProtectedRoute roles={['student']}><StudentBadges /></ProtectedRoute>} />

          {/* Mentor */}
          <Route path="/mentor/dashboard" element={<ProtectedRoute roles={['mentor']}><MentorDashboard /></ProtectedRoute>} />
          <Route path="/mentor/courses" element={<ProtectedRoute roles={['mentor']}><MentorCourses /></ProtectedRoute>} />
          <Route path="/mentor/students" element={<ProtectedRoute roles={['mentor']}><MentorStudents /></ProtectedRoute>} />
          <Route path="/mentor/certificates" element={<ProtectedRoute roles={['mentor']}><MentorCertificates /></ProtectedRoute>} />
          <Route path="/mentor/chat" element={<ProtectedRoute roles={['mentor']}><StudentChat /></ProtectedRoute>} />

          {/* Admin */}
          <Route path="/admin/dashboard" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><AdminUsers /></ProtectedRoute>} />
          <Route path="/admin/courses" element={<ProtectedRoute roles={['admin']}><AdminCourses /></ProtectedRoute>} />
          <Route path="/admin/reports" element={<ProtectedRoute roles={['admin']}><AdminReports /></ProtectedRoute>} />
          <Route path="/admin/badges" element={<ProtectedRoute roles={['admin']}><AdminBadges /></ProtectedRoute>} />

          {/* Employer */}
          <Route path="/employer/dashboard" element={<ProtectedRoute roles={['employer']}><EmployerDashboard /></ProtectedRoute>} />
          <Route path="/employer/students" element={<ProtectedRoute roles={['employer']}><StudentDirectory /></ProtectedRoute>} />

          {/* Shared Meeting Route */}
          <Route path="/meeting/:roomName" element={<ProtectedRoute roles={['student', 'mentor']}><VideoMeeting /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
